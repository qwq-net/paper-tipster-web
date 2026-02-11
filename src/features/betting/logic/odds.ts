import { RACE_EVENTS, raceEventEmitter } from '@/lib/sse/event-emitter';
import { db } from '@/shared/db';
import { bets, raceInstances, raceOdds } from '@/shared/db/schema';
import { redis } from '@/shared/lib/redis';
import { isOrderSensitive } from '@/shared/utils/payout';
import { BetDetail, BetType } from '@/types/betting';
import { eq } from 'drizzle-orm';

const ODDS_DEDUCTION_RATE = 0.2;
const THROTTLE_SECONDS = 10;

export async function calculateOdds(raceId: string) {
  const raceBets = await db.query.bets.findMany({
    where: eq(bets.raceId, raceId),
  });

  const winOdds: Record<string, number> = {};
  const placeOdds: Record<string, { min: number; max: number }> = {};

  if (raceBets.length > 0) {
    const winBets = raceBets.filter((bet) => {
      const details = bet.details as BetDetail;
      return details.type === 'win';
    });

    const winPool = winBets.reduce((sum, bet) => sum + bet.amount, 0);
    const winVotes: Record<string, number> = {};

    winBets.forEach((bet) => {
      const details = bet.details as BetDetail;
      const horseNumber = details.selections[0];
      if (horseNumber) {
        winVotes[horseNumber] = (winVotes[horseNumber] || 0) + bet.amount;
      }
    });

    const returnAmount = winPool * (1 - ODDS_DEDUCTION_RATE);

    Object.entries(winVotes).forEach(([horse, amount]) => {
      if (amount === 0) {
        winOdds[horse] = 0.0;
        return;
      }
      let odds = returnAmount / amount;
      odds = Math.floor(odds * 10) / 10;
      if (odds < 1.1) odds = 1.1;
      winOdds[horse] = odds;
    });
  } else {
  }

  await db
    .insert(raceOdds)
    .values({
      raceId,
      winOdds,
      placeOdds,
    })
    .onConflictDoUpdate({
      target: raceOdds.raceId,
      set: {
        winOdds,
        placeOdds,
        updatedAt: new Date(),
      },
    });

  const lastNotificationKey = `race:${raceId}:last_odds_notification`;
  const updateScheduledKey = `race:${raceId}:update_scheduled`;

  const isThrottled = await redis.get(lastNotificationKey);

  if (!isThrottled) {
    raceEventEmitter.emit(RACE_EVENTS.RACE_ODDS_UPDATED, {
      raceId,
      data: { winOdds, placeOdds, updatedAt: new Date() },
    });
    await redis.set(lastNotificationKey, 'true', 'EX', THROTTLE_SECONDS);
  } else {
    const ttl = await redis.ttl(lastNotificationKey);
    const delay = ttl > 0 ? ttl * 1000 : 0;

    const result = await redis.set(updateScheduledKey, 'true', 'EX', ttl + 1, 'NX');

    if (result === 'OK') {
      setTimeout(async () => {
        try {
          const latestOdds = await getRaceOdds(raceId);
          if (latestOdds) {
            console.log(`[Odds] Executing trailing edge update for race: ${raceId}`);
            raceEventEmitter.emit(RACE_EVENTS.RACE_ODDS_UPDATED, {
              raceId,
              data: {
                winOdds: latestOdds.winOdds as Record<string, number>,
                placeOdds: latestOdds.placeOdds as Record<string, { min: number; max: number }>,
                updatedAt: latestOdds.updatedAt,
              },
            });
            await redis.set(lastNotificationKey, 'true', 'EX', THROTTLE_SECONDS);
          }
        } catch (error) {
          console.error('[Odds] Failed to execute trailing edge update:', error);
        } finally {
          await redis.del(updateScheduledKey);
        }
      }, delay);
    }
  }
}

export async function calculateAllProvisionalOdds(raceId: string) {
  const [raceBets, race] = await Promise.all([
    db.query.bets.findMany({
      where: eq(bets.raceId, raceId),
    }),
    db.query.raceInstances.findFirst({
      where: eq(raceInstances.id, raceId),
      columns: { guaranteedOdds: true },
    }),
  ]);

  const guaranteedOdds = race?.guaranteedOdds as Record<string, number> | undefined;

  const poolByBetType: Record<string, number> = {};
  const amountBySelection: Record<string, Record<string, number>> = {};

  for (const bet of raceBets) {
    const details = bet.details as BetDetail;
    const betType = details.type as BetType;
    const key = JSON.stringify(
      isOrderSensitive(betType) ? details.selections : [...details.selections].sort((a, b) => a - b)
    );

    poolByBetType[betType] = (poolByBetType[betType] || 0) + bet.amount;
    if (!amountBySelection[betType]) amountBySelection[betType] = {};
    amountBySelection[betType][key] = (amountBySelection[betType][key] || 0) + bet.amount;
  }

  const provisionalOdds: Record<string, Record<string, number>> = {};

  for (const [type, pool] of Object.entries(poolByBetType)) {
    provisionalOdds[type] = {};
    const selections = amountBySelection[type];

    for (const [key, amount] of Object.entries(selections)) {
      if (amount === 0) continue;

      let rate = (pool * (1 - ODDS_DEDUCTION_RATE)) / amount;
      rate = Math.floor(rate * 10) / 10;

      if (guaranteedOdds && guaranteedOdds[type]) {
        rate = Math.max(rate, guaranteedOdds[type]);
      }

      if (rate < 1.1) rate = 1.1;
      provisionalOdds[type][key] = rate;
    }
  }

  return provisionalOdds;
}

export async function getRaceOdds(raceId: string) {
  return db.query.raceOdds.findFirst({
    where: eq(raceOdds.raceId, raceId),
  });
}
