'use server';

import { db } from '@/shared/db';
import { bets, payoutResults as payoutResultsTable, raceInstances, transactions, wallets } from '@/shared/db/schema';
import { ADMIN_ERRORS, requireAdmin, revalidateRacePaths } from '@/shared/utils/admin';
import { normalizeSelections, ODDS_UNIT } from '@/shared/utils/payout';
import { BetDetail } from '@/types/betting';
import { eq, sql } from 'drizzle-orm';

export async function finalizePayout(raceId: string) {
  await requireAdmin();

  const race = await db.query.raceInstances.findFirst({
    where: eq(raceInstances.id, raceId),
  });

  if (!race || race.status === 'FINALIZED') {
    throw new Error(ADMIN_ERRORS.NOT_FOUND);
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

    const walletPayouts = new Map<string, number>();
    const payoutDetails: {
      betId: string;
      walletId: string;
      status: 'HIT' | 'LOST' | 'REFUNDED';
      payout: number;
      odds: string;
    }[] = [];

    for (const bet of allBets) {
      const betDetail = bet.details as BetDetail;
      const typeResults = resultsMap.get(betDetail.type) || [];
      const betKey = normalizeSelections(betDetail.type, betDetail.selections);

      const hitResult = typeResults.find((r) => normalizeSelections(betDetail.type, r.numbers) === betKey);
      const refundResult = !hitResult ? typeResults.find((r) => r.numbers.length === 0) : null;

      let status: 'HIT' | 'LOST' | 'REFUNDED' = 'LOST';
      let payout = 0;
      let odds = '0.0';

      if (hitResult) {
        status = 'HIT';
        payout = Math.floor((bet.amount * hitResult.payout) / ODDS_UNIT);
        odds = (hitResult.payout / ODDS_UNIT).toFixed(1);
      } else if (refundResult) {
        status = 'REFUNDED';
        payout = Math.floor((bet.amount * refundResult.payout) / ODDS_UNIT);
        odds = (refundResult.payout / ODDS_UNIT).toFixed(1);
      }

      payoutDetails.push({ betId: bet.id, walletId: bet.walletId, status, payout, odds });

      if (payout > 0) {
        const currentTotal = walletPayouts.get(bet.walletId) || 0;
        walletPayouts.set(bet.walletId, currentTotal + payout);
      }
    }

    for (const detail of payoutDetails) {
      await tx
        .update(bets)
        .set({ status: detail.status, payout: detail.payout, odds: detail.odds })
        .where(eq(bets.id, detail.betId));
    }

    for (const [walletId, totalPayout] of walletPayouts.entries()) {
      if (totalPayout > 0) {
        await tx
          .update(wallets)
          .set({ balance: sql`${wallets.balance} + ${totalPayout}` })
          .where(eq(wallets.id, walletId));
      }
    }

    const transactionValues = payoutDetails
      .filter((d) => d.payout > 0)
      .map((d) => ({
        walletId: d.walletId,
        type: 'PAYOUT' as const,
        amount: d.payout,
        referenceId: d.betId,
      }));
    if (transactionValues.length > 0) {
      await tx.insert(transactions).values(transactionValues);
    }

    await tx
      .update(raceInstances)
      .set({
        status: 'FINALIZED',
        finalizedAt: new Date(),
      })
      .where(eq(raceInstances.id, raceId));
  });

  const { raceEventEmitter, RACE_EVENTS } = await import('@/shared/lib/sse/event-emitter');
  raceEventEmitter.emit(RACE_EVENTS.RACE_BROADCAST, { raceId, timestamp: Date.now() });

  revalidateRacePaths(raceId);

  return { success: true };
}

export async function getPayoutResults(raceId: string) {
  return db.select().from(payoutResultsTable).where(eq(payoutResultsTable.raceId, raceId));
}
