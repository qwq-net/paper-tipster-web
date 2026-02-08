import { RACE_EVENTS, raceEventEmitter } from '@/lib/sse/event-emitter';
import { db } from '@/shared/db';
import { bets, raceOdds } from '@/shared/db/schema';
import { redis } from '@/shared/lib/redis';
import { BetDetail } from '@/types/betting';
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

export async function getRaceOdds(raceId: string) {
  return db.query.raceOdds.findFirst({
    where: eq(raceOdds.raceId, raceId),
  });
}
