'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { bets, raceEntries, races, transactions, wallets } from '@/shared/db/schema';
import { calculatePayoutRate, Finisher, isWinningBet } from '@/shared/utils/payout';
import { BetDetail } from '@/types/betting';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const raceSchema = z.object({
  date: z.string().min(1),
  location: z.string().min(1),
  name: z.string().min(1),
  distance: z.coerce.number().min(100),
  surface: z.enum(['芝', 'ダート']),
  condition: z.enum(['良', '稍重', '重', '不良']).optional(),
});

export async function createRace(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const conditionValue = formData.get('condition');
  const parse = raceSchema.safeParse({
    date: formData.get('date'),
    location: formData.get('location'),
    name: formData.get('name'),
    distance: formData.get('distance'),
    surface: formData.get('surface'),
    condition: conditionValue && conditionValue !== '' ? conditionValue : undefined,
  });

  if (!parse.success) {
    throw new Error('Invalid Input');
  }

  await db.insert(races).values({
    date: parse.data.date,
    location: parse.data.location,
    name: parse.data.name,
    distance: parse.data.distance,
    surface: parse.data.surface,
    condition: parse.data.condition,
  });

  revalidatePath('/admin/races');
}

export async function updateRace(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const conditionValue = formData.get('condition');
  const parse = raceSchema.safeParse({
    date: formData.get('date'),
    location: formData.get('location'),
    name: formData.get('name'),
    distance: formData.get('distance'),
    surface: formData.get('surface'),
    condition: conditionValue && conditionValue !== '' ? conditionValue : undefined,
  });

  if (!parse.success) {
    throw new Error('Invalid Input');
  }

  await db
    .update(races)
    .set({
      date: parse.data.date,
      location: parse.data.location,
      name: parse.data.name,
      distance: parse.data.distance,
      surface: parse.data.surface,
      condition: parse.data.condition,
    })
    .where(eq(races.id, id));

  revalidatePath('/admin/races');
}

export async function getRaces() {
  return db.select().from(races).orderBy(desc(races.date), races.name);
}

export async function finalizeRace(
  raceId: string,
  results: { entryId: string; finishPosition: number }[],
  options: { payoutMode: 'TOTAL_DISTRIBUTION' | 'MANUAL'; takeoutRate: number } = {
    payoutMode: 'TOTAL_DISTRIBUTION',
    takeoutRate: 0,
  }
) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  await db.transaction(async (tx) => {
    // 1. 各出走馬の最終着順を更新
    for (const result of results) {
      await tx
        .update(raceEntries)
        .set({ finishPosition: result.finishPosition })
        .where(eq(raceEntries.id, result.entryId));
    }

    // 2. 着順情報の整理（的中判定用）
    const raceEntriesWithInfo = await tx.query.raceEntries.findMany({
      where: eq(raceEntries.raceId, raceId),
      with: { horse: true },
      orderBy: [raceEntries.finishPosition],
    });

    const finishers: Finisher[] = raceEntriesWithInfo
      .filter((e) => e.finishPosition !== null)
      .map((e) => ({
        horseNumber: e.horseNumber!,
        bracketNumber: e.bracketNumber!,
      }));

    if (finishers.length === 0) throw new Error('No results provided');

    // 3. 全ての購入馬券を取得
    const allBets = await tx.query.bets.findMany({
      where: eq(bets.raceId, raceId),
    });

    // 4. 券種ごとのプール金と的中票の集計
    const poolByBetType: Record<string, number> = {};
    const winnersByBetType: Record<string, { bet: (typeof allBets)[0]; totalWinningAmount: number }[]> = {};

    for (const bet of allBets) {
      const betDetail = bet.details as BetDetail;
      poolByBetType[betDetail.type] = (poolByBetType[betDetail.type] || 0) + bet.amount;

      if (isWinningBet(betDetail, finishers)) {
        if (!winnersByBetType[betDetail.type]) winnersByBetType[betDetail.type] = [];
        winnersByBetType[betDetail.type].push({ bet, totalWinningAmount: 0 });
      }
    }

    // 各券種の「総的中金額」を算出
    for (const type in winnersByBetType) {
      const totalWinningAmount = winnersByBetType[type].reduce((sum, w) => sum + w.bet.amount, 0);
      winnersByBetType[type].forEach((w) => (w.totalWinningAmount = totalWinningAmount));
    }

    // 5. 払い戻しの実行
    const takeoutRate = options.payoutMode === 'TOTAL_DISTRIBUTION' ? 0 : options.takeoutRate;

    for (const bet of allBets) {
      const betDetail = bet.details as BetDetail;
      const winners = winnersByBetType[betDetail.type] || [];
      const winnerInfo = winners.find((w) => w.bet.id === bet.id);

      if (winnerInfo) {
        // 的中：配当計算
        const rate = calculatePayoutRate(poolByBetType[betDetail.type], winnerInfo.totalWinningAmount, takeoutRate);
        const payout = Math.floor(bet.amount * rate);

        await tx
          .update(bets)
          .set({ status: 'HIT', payout, odds: rate.toFixed(1) })
          .where(eq(bets.id, bet.id));

        // ウォレットに残高追加
        const wallet = await tx.query.wallets.findFirst({
          where: eq(wallets.id, bet.walletId),
        });
        if (wallet) {
          await tx
            .update(wallets)
            .set({ balance: wallet.balance + payout })
            .where(eq(wallets.id, wallet.id));

          // 取引履歴の記録
          await tx.insert(transactions).values({
            walletId: wallet.id,
            type: 'PAYOUT',
            amount: payout,
            referenceId: bet.id,
          });
        }
      } else {
        // 不的中
        await tx.update(bets).set({ status: 'LOST', payout: 0 }).where(eq(bets.id, bet.id));
      }
    }

    // 6. レースステータスを確定に変更
    await tx
      .update(races)
      .set({
        status: 'FINALIZED',
        finalizedAt: new Date(),
      })
      .where(eq(races.id, raceId));
  });

  revalidatePath('/admin/races');
  revalidatePath(`/admin/races/${raceId}`);
  revalidatePath('/mypage');
}
