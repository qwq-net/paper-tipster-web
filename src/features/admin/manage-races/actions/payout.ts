'use server';

import { BetDetail } from '@/entities/bet';
import { db } from '@/shared/db';
import { bets, payoutResults as payoutResultsTable, raceInstances, transactions, wallets } from '@/shared/db/schema';
import { ADMIN_ERRORS, requireAdmin, revalidateRacePaths } from '@/shared/utils/admin';
import { normalizeSelections, ODDS_UNIT } from '@/shared/utils/payout';
import { eq, inArray, sql } from 'drizzle-orm';

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

    if (allBets.length === 0) {
      await tx
        .update(raceInstances)
        .set({
          status: 'FINALIZED',
          finalizedAt: new Date(),
        })
        .where(eq(raceInstances.id, raceId));
      return;
    }

    const walletPayouts = new Map<string, number>();
    const betUpdates: {
      id: string;
      status: 'HIT' | 'LOST';
      payout: number;
      odds: string;
    }[] = [];

    for (const bet of allBets) {
      const betDetail = bet.details as BetDetail;
      const typeResults = resultsMap.get(betDetail.type) || [];
      const betKey = normalizeSelections(betDetail.type, betDetail.selections);

      const hitResult = typeResults.find((r) => normalizeSelections(betDetail.type, r.numbers) === betKey);

      let status: 'HIT' | 'LOST' = 'LOST';
      let payout = 0;
      let odds = '0.0';

      if (hitResult) {
        status = 'HIT';
        payout = Math.floor((bet.amount * hitResult.payout) / ODDS_UNIT);
        odds = (hitResult.payout / ODDS_UNIT).toFixed(1);
      }

      betUpdates.push({ id: bet.id, status, payout, odds });

      if (payout > 0) {
        const currentTotal = walletPayouts.get(bet.walletId) || 0;
        walletPayouts.set(bet.walletId, currentTotal + payout);
      }
    }

    if (betUpdates.length > 0) {
      const CHUNK_SIZE = 1000;
      for (let i = 0; i < betUpdates.length; i += CHUNK_SIZE) {
        const chunk = betUpdates.slice(i, i + CHUNK_SIZE);
        const chunkIds = chunk.map((b) => b.id);

        const chunkStatusCase = sql<
          'HIT' | 'LOST'
        >`CASE id ${sql.raw(chunk.map((b) => `WHEN '${b.id}' THEN '${b.status}'`).join(' '))} END::bet_status`;
        const chunkPayoutCase = sql<number>`CASE id ${sql.raw(
          chunk.map((b) => `WHEN '${b.id}' THEN ${b.payout}`).join(' ')
        )} END::bigint`;
        const chunkOddsCase = sql<string>`CASE id ${sql.raw(
          chunk.map((b) => `WHEN '${b.id}' THEN ${b.odds}`).join(' ')
        )} END::numeric`;

        await tx
          .update(bets)
          .set({
            status: chunkStatusCase,
            payout: chunkPayoutCase,
            odds: chunkOddsCase,
          })
          .where(inArray(bets.id, chunkIds));
      }
    }

    for (const [walletId, totalPayout] of walletPayouts.entries()) {
      if (totalPayout > 0) {
        await tx
          .update(wallets)
          .set({ balance: sql`${wallets.balance} + ${totalPayout}` })
          .where(eq(wallets.id, walletId));
      }
    }

    const transactionValues = betUpdates
      .filter((d) => d.payout > 0)
      .map((d) => ({
        walletId: allBets.find((b) => b.id === d.id)!.walletId,
        type: 'PAYOUT' as const,
        amount: d.payout,
        referenceId: d.id,
      }));

    if (transactionValues.length > 0) {
      const TX_BATCH_SIZE = 1000;
      for (let i = 0; i < transactionValues.length; i += TX_BATCH_SIZE) {
        await tx.insert(transactions).values(transactionValues.slice(i, i + TX_BATCH_SIZE));
      }
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
