'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { bets, payoutResults as payoutResultsTable, races, transactions, wallets } from '@/shared/db/schema';
import { BetDetail } from '@/types/betting';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function finalizePayout(raceId: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  const race = await db.query.races.findFirst({
    where: eq(races.id, raceId),
  });

  if (!race || race.status === 'FINALIZED') {
    throw new Error('Race already finalized or not found');
  }

  const results = await db.select().from(payoutResultsTable).where(eq(payoutResultsTable.raceId, raceId));
  const resultsMap = new Map<string, Array<{ numbers: number[]; payout: number }>>();
  for (const r of results) {
    resultsMap.set(r.type, r.combinations as Array<{ numbers: number[]; payout: number }>);
  }

  await db.transaction(async (tx) => {
    const allBets = await tx.query.bets.findMany({
      where: eq(bets.raceId, raceId),
    });

    for (const bet of allBets) {
      const betDetail = bet.details as BetDetail;
      const typeResults = resultsMap.get(betDetail.type) || [];

      const hitResult = typeResults.find((r) => JSON.stringify(r.numbers) === JSON.stringify(betDetail.selections));

      const refundResult = !hitResult ? typeResults.find((r) => r.numbers.length === 0) : null;

      let status: 'HIT' | 'LOST' | 'REFUNDED' = 'LOST';
      let payout = 0;
      let odds = '0.0';

      if (hitResult) {
        status = 'HIT';
        payout = Math.floor((bet.amount * hitResult.payout) / 100);
        odds = (hitResult.payout / 100).toFixed(1);
      } else if (refundResult) {
        status = 'REFUNDED';
        payout = Math.floor((bet.amount * refundResult.payout) / 100);
        odds = (refundResult.payout / 100).toFixed(1);
      }

      await tx.update(bets).set({ status, payout, odds }).where(eq(bets.id, bet.id));

      if (payout > 0) {
        const wallet = await tx.query.wallets.findFirst({
          where: eq(wallets.id, bet.walletId),
        });
        if (wallet) {
          await tx
            .update(wallets)
            .set({ balance: wallet.balance + payout })
            .where(eq(wallets.id, wallet.id));

          await tx.insert(transactions).values({
            walletId: wallet.id,
            type: 'PAYOUT',
            amount: payout,
            referenceId: bet.id,
          });
        }
      }
    }

    await tx
      .update(races)
      .set({
        status: 'FINALIZED',
        finalizedAt: new Date(),
      })
      .where(eq(races.id, raceId));
  });

  const { raceEventEmitter, RACE_EVENTS } = await import('@/lib/sse/event-emitter');
  raceEventEmitter.emit(RACE_EVENTS.RACE_BROADCAST, { raceId, timestamp: Date.now() });

  revalidatePath('/admin/races');
  revalidatePath(`/admin/races/${raceId}`);
  revalidatePath(`/races/${raceId}`);
  revalidatePath(`/races/${raceId}/standby`);
  revalidatePath('/mypage');

  return { success: true };
}

export async function getPayoutResults(raceId: string) {
  return db.select().from(payoutResultsTable).where(eq(payoutResultsTable.raceId, raceId));
}
