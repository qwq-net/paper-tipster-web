import { db } from '@/shared/db';
import { bets, raceInstances, raceOdds } from '@/shared/db/schema';
import { redis } from '@/shared/lib/redis';
import { RACE_EVENTS, raceEventEmitter } from '@/shared/lib/sse/event-emitter';
import { eq } from 'drizzle-orm';

import { aggregateOddsPool, BetDetail, calculateProvisionalOdds, calculateWinOdds } from '@/entities/bet';

const THROTTLE_SECONDS = 10;

export async function calculateOdds(raceId: string) {
  const raceBets = (await db.query.bets.findMany({
    where: eq(bets.raceId, raceId),
  })) as { amount: number; details: BetDetail }[];

  const winBets = raceBets.filter((bet) => bet.details.type === 'win');

  const winOdds = calculateWinOdds(winBets);
  const placeOdds: Record<string, { min: number; max: number }> = {};

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
  const [raceBetsRaw, race] = await Promise.all([
    db.query.bets.findMany({
      where: eq(bets.raceId, raceId),
    }),
    db.query.raceInstances.findFirst({
      where: eq(raceInstances.id, raceId),
      columns: { guaranteedOdds: true },
    }),
  ]);

  const raceBets = raceBetsRaw as { amount: number; details: BetDetail }[];
  const pool = aggregateOddsPool(raceBets);
  return calculateProvisionalOdds(pool, (race?.guaranteedOdds as Record<string, number>) || undefined);
}

export async function getRaceOdds(raceId: string) {
  return db.query.raceOdds.findFirst({
    where: eq(raceOdds.raceId, raceId),
  });
}
