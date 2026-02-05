'use server';

import { db } from '@/shared/db';
import { bets } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';

export async function getEventsWithRaces() {
  return db.query.events.findMany({
    orderBy: (events, { desc }) => [desc(events.date)],
    with: {
      races: {
        orderBy: (raceInstances, { asc }) => [asc(raceInstances.raceNumber)],
        with: {
          entries: true,
        },
      },
    },
  });
}

export async function getBetsByRace(raceId: string) {
  return db.query.bets.findMany({
    where: eq(bets.raceId, raceId),
    orderBy: (bets, { desc }) => [desc(bets.createdAt)],
    with: {
      user: true,
    },
  });
}

export async function getRaceWithBets(raceId: string) {
  return db.query.raceInstances.findFirst({
    where: (raceInstances, { eq }) => eq(raceInstances.id, raceId),
    with: {
      event: true,
    },
  });
}
