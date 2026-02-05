'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { bets, raceEntries, raceInstances } from '@/shared/db/schema';
import { calculatePayoutRate, Finisher, isWinningBet } from '@/shared/utils/payout';
import { BetDetail } from '@/types/betting';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

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
    throw new Error('認証されていません');
  }

  await db.transaction(async (tx) => {
    for (const result of results) {
      await tx
        .update(raceEntries)
        .set({ finishPosition: result.finishPosition })
        .where(eq(raceEntries.id, result.entryId));
    }

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

    if (finishers.length === 0) throw new Error('着順が指定されていません');

    const allBets = await tx.query.bets.findMany({
      where: eq(bets.raceId, raceId),
    });

    const poolByBetType: Record<string, number> = {};
    const winnersByBetType: Record<string, { bet: (typeof allBets)[0]; selectionKey: string }[]> = {};
    const winningSelectionAmounts: Record<string, Record<string, number>> = {};

    for (const bet of allBets) {
      const betDetail = bet.details as BetDetail;
      const type = betDetail.type;
      poolByBetType[type] = (poolByBetType[type] || 0) + bet.amount;

      if (isWinningBet(betDetail, finishers)) {
        const selectionKey = JSON.stringify(betDetail.selections);
        if (!winnersByBetType[type]) winnersByBetType[type] = [];
        winnersByBetType[type].push({ bet, selectionKey });

        if (!winningSelectionAmounts[type]) winningSelectionAmounts[type] = {};
        winningSelectionAmounts[type][selectionKey] = (winningSelectionAmounts[type][selectionKey] || 0) + bet.amount;
      }
    }

    const takeoutRate = options.payoutMode === 'TOTAL_DISTRIBUTION' ? 0 : options.takeoutRate;
    const currentTokubaraiRate = 1 - takeoutRate;

    const payoutCalculationsByType: Record<string, { numbers: number[]; payout: number }[]> = {};

    for (const bet of allBets) {
      const betDetail = bet.details as BetDetail;
      const type = betDetail.type;
      const winners = winnersByBetType[type] || [];
      const hasWinner = winners.length > 0;

      const winnerInfo = winners.find((w) => w.bet.id === bet.id);

      if (hasWinner) {
        if (winnerInfo) {
          const selectionKey = winnerInfo.selectionKey;
          const selectionAmount = winningSelectionAmounts[type][selectionKey];
          const totalWinningAmount = Object.values(winningSelectionAmounts[type]).reduce((sum, val) => sum + val, 0);
          const winningCount = Object.keys(winningSelectionAmounts[type]).length;

          const rate = calculatePayoutRate(
            poolByBetType[type],
            selectionAmount,
            totalWinningAmount,
            winningCount,
            takeoutRate
          );

          if (!payoutCalculationsByType[type]) payoutCalculationsByType[type] = [];
          if (
            !payoutCalculationsByType[type].find(
              (p) => JSON.stringify(p.numbers) === JSON.stringify(betDetail.selections)
            )
          ) {
            const unitPayout = Math.floor(100 * rate);
            payoutCalculationsByType[type].push({ numbers: betDetail.selections, payout: unitPayout });
          }
        }
      } else {
        if (poolByBetType[type] > 0) {
          if (!payoutCalculationsByType[type]) payoutCalculationsByType[type] = [];
          if (payoutCalculationsByType[type].length === 0) {
            const tokubaraiPayout = Math.floor(100 * currentTokubaraiRate);
            payoutCalculationsByType[type].push({ numbers: [], payout: tokubaraiPayout });
          }
        }
      }
    }

    const { getWinningCombinations: getWinningCombos } = await import('@/shared/utils/payout');
    const { BET_TYPES } = await import('@/types/betting');

    for (const type of Object.values(BET_TYPES)) {
      const winningCombos = getWinningCombos(type, finishers);
      if (!payoutCalculationsByType[type]) payoutCalculationsByType[type] = [];

      for (const combo of winningCombos) {
        const alreadyExists = payoutCalculationsByType[type].find(
          (p) => JSON.stringify(p.numbers) === JSON.stringify(combo)
        );

        if (!alreadyExists) {
          payoutCalculationsByType[type].push({ numbers: combo, payout: 70 });
        }
      }

      payoutCalculationsByType[type] = payoutCalculationsByType[type]
        .filter((p) => p.numbers.length > 0)
        .sort((a, b) => {
          return a.numbers.join('-').localeCompare(b.numbers.join('-'));
        });
    }

    const { payoutResults: payoutResultsTable } = await import('@/shared/db/schema');
    await tx.delete(payoutResultsTable).where(eq(payoutResultsTable.raceId, raceId));

    for (const [type, combinations] of Object.entries(payoutCalculationsByType)) {
      if (combinations.length > 0) {
        await tx.insert(payoutResultsTable).values({
          raceId,
          type,
          combinations,
        });
      }
    }

    await tx
      .update(raceInstances)
      .set({
        status: 'CLOSED',
      })
      .where(eq(raceInstances.id, raceId));
  });

  revalidatePath('/admin/races');
  revalidatePath(`/admin/races/${raceId}`);
  revalidatePath(`/races/${raceId}`);
  revalidatePath(`/races/${raceId}/standby`);
  revalidatePath('/mypage');
}
