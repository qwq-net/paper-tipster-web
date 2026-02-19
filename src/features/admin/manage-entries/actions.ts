'use server';

import { db } from '@/shared/db';
import { horses, raceEntries, raceInstances, venues } from '@/shared/db/schema';
import { requireAdmin } from '@/shared/utils/admin';
import { calculateBracketNumber } from '@/shared/utils/bracket';
import { asc, desc, eq, notInArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getEntries() {
  await requireAdmin();

  const entries = await db
    .select({
      id: raceEntries.id,
      bracketNumber: raceEntries.bracketNumber,
      horseNumber: raceEntries.horseNumber,
      jockey: raceEntries.jockey,
      weight: raceEntries.weight,
      status: raceEntries.status,
      raceId: raceInstances.id,
      raceDate: raceInstances.date,
      raceLocation: venues.shortName,
      raceName: raceInstances.name,
      horseName: horses.name,
      horseGender: horses.gender,
    })
    .from(raceEntries)
    .innerJoin(raceInstances, eq(raceEntries.raceId, raceInstances.id))
    .innerJoin(horses, eq(raceEntries.horseId, horses.id))
    .leftJoin(venues, eq(raceInstances.venueId, venues.id))
    .orderBy(desc(raceInstances.date), asc(raceInstances.name), asc(raceEntries.horseNumber));

  return entries;
}

export async function getRacesForSelect() {
  await requireAdmin();

  const allRaces = await db.query.raceInstances.findMany({
    where: eq(raceInstances.status, 'SCHEDULED'),
    columns: {
      id: true,
      eventId: true,
      name: true,
      raceNumber: true,
      distance: true,
      surface: true,
      finalizedAt: true,
      date: true,
    },
    with: {
      event: true,
      venue: {
        columns: {
          shortName: true,
        },
      },
    },
    orderBy: (raceInstances, { asc, desc }) => [
      desc(raceInstances.date),
      asc(raceInstances.raceNumber),
      asc(raceInstances.name),
    ],
  });

  const races = allRaces.map((race) => ({
    ...race,
    raceLocation: race.venue?.shortName,
  }));

  const eventsMap = new Map<
    string,
    {
      id: string;
      name: string;
      date: string;
      races: Array<{
        id: string;
        name: string;
        raceNumber: number | null;
        venue: {
          shortName: string;
        };
        date: string;
      }>;
    }
  >();

  for (const race of races) {
    if (!eventsMap.has(race.eventId)) {
      eventsMap.set(race.eventId, {
        id: race.event.id,
        name: race.event.name,
        date: race.event.date,
        races: [],
      });
    }
    eventsMap.get(race.eventId)!.races.push({
      id: race.id,
      name: race.name,
      raceNumber: race.raceNumber,
      venue: {
        shortName: race.venue?.shortName || '',
      },
      date: race.date,
    });
  }

  return Array.from(eventsMap.values());
}

export async function getHorsesForSelect() {
  await requireAdmin();

  return db.select({ id: horses.id, name: horses.name }).from(horses).orderBy(horses.name);
}

export async function getRaceById(raceId: string) {
  return db.query.raceInstances.findFirst({
    where: eq(raceInstances.id, raceId),
    with: {
      event: true,
      venue: true,
    },
  });
}

export async function getEntriesForRace(raceId: string) {
  return db
    .select({
      id: raceEntries.id,
      horseId: raceEntries.horseId,
      bracketNumber: raceEntries.bracketNumber,
      horseNumber: raceEntries.horseNumber,
      horseName: horses.name,
      horseGender: horses.gender,
      horseAge: horses.age,
      finishPosition: raceEntries.finishPosition,
    })
    .from(raceEntries)
    .innerJoin(horses, eq(raceEntries.horseId, horses.id))
    .where(eq(raceEntries.raceId, raceId))
    .orderBy(raceEntries.horseNumber);
}

export async function getAvailableHorses(raceId: string) {
  const existingEntries = await db
    .select({ horseId: raceEntries.horseId })
    .from(raceEntries)
    .where(eq(raceEntries.raceId, raceId));

  const existingHorseIds = existingEntries.map((e) => e.horseId);

  if (existingHorseIds.length === 0) {
    return db
      .select({ id: horses.id, name: horses.name, gender: horses.gender, age: horses.age })
      .from(horses)
      .orderBy(horses.name);
  }

  return db
    .select({ id: horses.id, name: horses.name, gender: horses.gender, age: horses.age })
    .from(horses)
    .where(notInArray(horses.id, existingHorseIds))
    .orderBy(horses.name);
}

export async function saveEntries(raceId: string, horseIds: string[]) {
  await requireAdmin();

  await db.delete(raceEntries).where(eq(raceEntries.raceId, raceId));

  if (horseIds.length > 0) {
    const totalHorses = horseIds.length;
    const entries = horseIds.map((horseId, index) => ({
      raceId,
      horseId,
      horseNumber: index + 1,
      bracketNumber: calculateBracketNumber(index + 1, totalHorses),
    }));

    await db.insert(raceEntries).values(entries);
  }

  revalidatePath(`/admin/entries/${raceId}`);
  revalidatePath('/admin/entries');
}

export async function deleteEntry(entryId: string, raceId: string) {
  await requireAdmin();

  await db.delete(raceEntries).where(eq(raceEntries.id, entryId));

  revalidatePath(`/admin/entries/${raceId}`);
  revalidatePath('/admin/entries');
}
