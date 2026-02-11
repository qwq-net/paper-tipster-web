'use server';

import { db } from '@/shared/db';
import { events } from '@/shared/db/schema';
import { desc } from 'drizzle-orm';

export async function getRaces() {
  return db.query.raceInstances.findMany({
    orderBy: (raceInstances, { asc, desc }) => [
      asc(raceInstances.raceNumber),
      desc(raceInstances.date),
      raceInstances.name,
    ],
    with: {
      event: true,
      venue: true,
      entries: true,
    },
  });
}

export async function getEvents() {
  return db.select().from(events).orderBy(desc(events.date), events.name);
}

export async function getRaceById(id: string) {
  return db.query.raceInstances.findFirst({
    where: (raceInstances, { eq }) => eq(raceInstances.id, id),
    with: {
      venue: true,
    },
  });
}
