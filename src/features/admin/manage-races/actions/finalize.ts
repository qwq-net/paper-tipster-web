'use server';

import { BetDetail, calculatePayoutRate, Finisher, isWinningBet, normalizeSelections, ODDS_UNIT } from '@/entities/bet';
import { DEFAULT_GUARANTEED_ODDS } from '@/shared/constants/odds';
import { db } from '@/shared/db';
import { bets, raceEntries, raceInstances } from '@/shared/db/schema';
import { requireAdmin, revalidateRacePaths } from '@/shared/utils/admin';
import { eq, sql, SQL } from 'drizzle-orm';

export async function finalizeRace(
  raceId: string,
  results: { entryId: string; finishPosition: number }[],
  options: { payoutMode: 'TOTAL_DISTRIBUTION' | 'MANUAL'; takeoutRate: number } = {
    payoutMode: 'TOTAL_DISTRIBUTION',
    takeoutRate: 0,
  }
) {
  await requireAdmin();

  await db.transaction(async (tx) => {
    if (results.length > 0) {
      const sqlChunks: SQL[] = [];
      const ids: string[] = [];

      sqlChunks.push(sql`(case`);
      for (const result of results) {
        sqlChunks.push(sql`when ${raceEntries.id} = ${result.entryId} then ${result.finishPosition}`);
        ids.push(result.entryId);
      }
      sqlChunks.push(sql`else ${raceEntries.finishPosition} end)`);

      const finalSql: SQL = sql.join(sqlChunks, sql` `);

      await tx.update(raceEntries).set({ finishPosition: finalSql }).where(eq(raceEntries.raceId, raceId));
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

    const { raceEventEmitter, RACE_EVENTS } = await import('@/shared/lib/sse/event-emitter');
    const rankingPayload = raceEntriesWithInfo
      .filter((e) => e.finishPosition !== null)
      .slice(0, 5)
      .map((e) => ({
        finishPosition: e.finishPosition!,
        horseNumber: e.horseNumber!,
        bracketNumber: e.bracketNumber!,
        horseName: e.horse!.name,
      }));

    raceEventEmitter.emit(RACE_EVENTS.RACE_RESULT_UPDATED, {
      raceId,
      results: rankingPayload,
      timestamp: Date.now(),
    });

    const allBets = await tx.query.bets.findMany({
      where: eq(bets.raceId, raceId),
    });

    const raceInstance = await tx.query.raceInstances.findFirst({
      where: eq(raceInstances.id, raceId),
      columns: { guaranteedOdds: true, eventId: true },
    });
    const guaranteedOdds = raceInstance?.guaranteedOdds as Record<string, number> | undefined;

    const poolByBetType: Record<string, number> = {};
    const winnersByBetType: Record<string, { bet: (typeof allBets)[0]; selectionKey: string }[]> = {};
    const winningSelectionAmounts: Record<string, Record<string, number>> = {};

    for (const bet of allBets) {
      const betDetail = bet.details as BetDetail;
      const type = betDetail.type;
      poolByBetType[type] = (poolByBetType[type] || 0) + bet.amount;

      if (isWinningBet(betDetail, finishers)) {
        const selectionKey = normalizeSelections(type, betDetail.selections);
        if (!winnersByBetType[type]) winnersByBetType[type] = [];
        winnersByBetType[type].push({ bet, selectionKey });

        if (!winningSelectionAmounts[type]) winningSelectionAmounts[type] = {};
        winningSelectionAmounts[type][selectionKey] = (winningSelectionAmounts[type][selectionKey] || 0) + bet.amount;
      }
    }

    const takeoutRate = options.payoutMode === 'TOTAL_DISTRIBUTION' ? 0 : options.takeoutRate;

    const payoutCalculationsByType: Record<string, { numbers: number[]; payout: number }[]> = {};

    for (const bet of allBets) {
      const betDetail = bet.details as BetDetail;
      const type = betDetail.type;
      const winners = winnersByBetType[type] || [];
      const winnerInfo = winners.find((w) => w.bet.id === bet.id);

      if (!winnerInfo) continue;

      const selectionKey = winnerInfo.selectionKey;
      const selectionAmount = winningSelectionAmounts[type][selectionKey];
      const totalWinningAmount = Object.values(winningSelectionAmounts[type]).reduce((sum, val) => sum + val, 0);
      const winningCount = Object.keys(winningSelectionAmounts[type]).length;

      let rate = calculatePayoutRate(
        poolByBetType[type],
        selectionAmount,
        totalWinningAmount,
        winningCount,
        takeoutRate
      );

      if (guaranteedOdds && guaranteedOdds[type]) {
        rate = Math.max(rate, guaranteedOdds[type]);
      }

      if (!payoutCalculationsByType[type]) payoutCalculationsByType[type] = [];

      const betKey = normalizeSelections(type, betDetail.selections);
      if (!payoutCalculationsByType[type].find((p) => normalizeSelections(type, p.numbers) === betKey)) {
        const unitPayout = Math.floor(ODDS_UNIT * rate);
        payoutCalculationsByType[type].push({ numbers: betDetail.selections, payout: unitPayout });
      }
    }

    const { BET_TYPES } = await import('@/entities/bet');
    const { getWinningCombinations } = await import('@/entities/bet');

    let raceCarryover = 0;

    for (const type of Object.values(BET_TYPES)) {
      if (!payoutCalculationsByType[type]) payoutCalculationsByType[type] = [];

      const winningCombinations = getWinningCombinations(type, finishers);
      const defaultRate =
        guaranteedOdds?.[type] ?? DEFAULT_GUARANTEED_ODDS[type as keyof typeof DEFAULT_GUARANTEED_ODDS] ?? 1.0;

      for (const combination of winningCombinations) {
        const key = normalizeSelections(type, combination);
        const exists = payoutCalculationsByType[type].some((p) => normalizeSelections(type, p.numbers) === key);
        if (!exists) {
          const payout = Math.floor(ODDS_UNIT * defaultRate);
          payoutCalculationsByType[type].push({ numbers: combination, payout });
        }
      }

      const hasActualWinners = (winnersByBetType[type] || []).length > 0;

      if (!hasActualWinners) {
        const pool = poolByBetType[type] || 0;
        if (pool > 0) {
          raceCarryover += pool;
        }
      }

      payoutCalculationsByType[type] = payoutCalculationsByType[type].sort((a, b) => {
        return a.numbers.join('-').localeCompare(b.numbers.join('-'));
      });
    }

    const { payoutResults: payoutResultsTable, events } = await import('@/shared/db/schema');
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

    if (raceCarryover > 0) {
      if (raceInstance) {
        await tx
          .update(events)
          .set({
            carryoverAmount: sql`${events.carryoverAmount} + ${raceCarryover}`,
          })
          .where(eq(events.id, raceInstance.eventId));
      }
    }

    await tx
      .update(raceInstances)
      .set({
        status: 'CLOSED',
      })
      .where(eq(raceInstances.id, raceId));
  });

  revalidateRacePaths(raceId);
}
