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

  let rankingPayload: {
    finishPosition: number;
    horseNumber: number;
    bracketNumber: number;
    horseName: string;
  }[] = [];

  await db.transaction(async (tx) => {
    const raceInstance = await tx.query.raceInstances.findFirst({
      where: eq(raceInstances.id, raceId),
      columns: { status: true, guaranteedOdds: true },
    });

    if (!raceInstance) {
      throw new Error('レースが見つかりません');
    }

    if (raceInstance.status === 'FINALIZED') {
      throw new Error('払戻確定済みのため着順を変更できません');
    }

    if (raceInstance.status !== 'CLOSED') {
      throw new Error('レースが締切状態ではありません');
    }

    if (results.length > 0) {
      const sqlChunks: SQL[] = [];

      sqlChunks.push(sql`(case`);
      for (const result of results) {
        sqlChunks.push(sql`when ${raceEntries.id} = ${result.entryId} then ${result.finishPosition}`);
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

    const invalidHorseIds = new Set(
      raceEntriesWithInfo.filter((e) => e.status === 'SCRATCHED' || e.status === 'EXCLUDED').map((e) => e.horseNumber!)
    );

    const validBrackets = new Set(
      raceEntriesWithInfo
        .filter((e) => e.status === 'ENTRANT')
        .map((e) => e.bracketNumber!)
        .filter((b): b is number => b !== null)
    );

    rankingPayload = raceEntriesWithInfo
      .filter((e) => e.finishPosition !== null)
      .slice(0, 5)
      .map((e) => ({
        finishPosition: e.finishPosition!,
        horseNumber: e.horseNumber!,
        bracketNumber: e.bracketNumber!,
        horseName: e.horse!.name,
      }));

    const allBets = await tx.query.bets.findMany({
      where: eq(bets.raceId, raceId),
    });

    const guaranteedOdds = raceInstance.guaranteedOdds as Record<string, number> | undefined;

    const poolByBetType: Record<string, number> = {};
    const winningSelectionAmounts: Record<string, Record<string, number>> = {};

    const isRefundedBet = (type: string, selections: number[]) => {
      if (type === 'bracket_quinella') {
        return selections.some((bracket) => !validBrackets.has(bracket));
      }
      return selections.some((horse) => invalidHorseIds.has(horse));
    };

    for (const bet of allBets) {
      const betDetail = bet.details as BetDetail;
      const type = betDetail.type;

      if (isRefundedBet(type, betDetail.selections)) {
        continue;
      }

      poolByBetType[type] = (poolByBetType[type] || 0) + bet.amount;

      if (isWinningBet(betDetail, finishers)) {
        const selectionKey = normalizeSelections(type, betDetail.selections);

        if (!winningSelectionAmounts[type]) winningSelectionAmounts[type] = {};
        winningSelectionAmounts[type][selectionKey] = (winningSelectionAmounts[type][selectionKey] || 0) + bet.amount;
      }
    }

    const takeoutRate =
      options.payoutMode === 'TOTAL_DISTRIBUTION' ? 0 : Math.max(0, Math.min(1, Number(options.takeoutRate || 0)));

    const payoutCalculationsByType: Record<string, { numbers: number[]; payout: number }[]> = {};

    for (const [type, selectionAmounts] of Object.entries(winningSelectionAmounts)) {
      const totalWinningAmount = Object.values(selectionAmounts).reduce((sum, amount) => sum + amount, 0);
      const winningCount = Object.keys(selectionAmounts).length;

      if (!payoutCalculationsByType[type]) payoutCalculationsByType[type] = [];

      for (const [selectionKey, selectionAmount] of Object.entries(selectionAmounts)) {
        let rate = calculatePayoutRate(
          poolByBetType[type],
          selectionAmount,
          totalWinningAmount,
          winningCount,
          takeoutRate
        );

        if (guaranteedOdds?.[type]) {
          rate = Math.max(rate, guaranteedOdds[type]);
        }

        const unitPayout = Math.floor(ODDS_UNIT * rate);
        payoutCalculationsByType[type].push({ numbers: JSON.parse(selectionKey) as number[], payout: unitPayout });
      }
    }

    const { BET_TYPES } = await import('@/entities/bet');
    const { getWinningCombinations } = await import('@/entities/bet');

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

      payoutCalculationsByType[type] = payoutCalculationsByType[type].sort((a, b) => {
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
  });

  const { raceEventEmitter, RACE_EVENTS } = await import('@/shared/lib/sse/event-emitter');
  raceEventEmitter.emit(RACE_EVENTS.RACE_RESULT_UPDATED, {
    raceId,
    results: rankingPayload,
    timestamp: Date.now(),
  });

  revalidateRacePaths(raceId);
}
