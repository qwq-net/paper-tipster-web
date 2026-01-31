'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { horses, raceEntries, races } from '@/shared/db/schema';
import { calculateBracketNumber } from '@/shared/utils/bracket';
import { eq, notInArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getEntries() {
  const entries = await db
    .select({
      id: raceEntries.id,
      bracketNumber: raceEntries.bracketNumber,
      horseNumber: raceEntries.horseNumber,
      jockey: raceEntries.jockey,
      weight: raceEntries.weight,
      status: raceEntries.status,
      raceId: races.id,
      raceDate: races.date,
      raceLocation: races.location,
      raceName: races.name,
      horseName: horses.name,
      horseGender: horses.gender,
    })
    .from(raceEntries)
    .innerJoin(races, eq(raceEntries.raceId, races.id))
    .innerJoin(horses, eq(raceEntries.horseId, horses.id))
    .orderBy(races.date, races.name, raceEntries.horseNumber);

  return entries;
}

export async function getRacesForSelect() {
  return db
    .select({
      id: races.id,
      date: races.date,
      location: races.location,
      name: races.name,
    })
    .from(races)
    .where(eq(races.status, 'SCHEDULED'))
    .orderBy(races.date, races.name);
}

export async function getHorsesForSelect() {
  return db.select({ id: horses.id, name: horses.name }).from(horses).orderBy(horses.name);
}

export async function getRaceById(raceId: string) {
  const result = await db.select().from(races).where(eq(races.id, raceId)).limit(1);
  return result[0] || null;
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
    return db.select({ id: horses.id, name: horses.name, gender: horses.gender }).from(horses).orderBy(horses.name);
  }

  return db
    .select({ id: horses.id, name: horses.name, gender: horses.gender })
    .from(horses)
    .where(notInArray(horses.id, existingHorseIds))
    .orderBy(horses.name);
}

export async function saveEntries(raceId: string, horseIds: string[]) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

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
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  await db.delete(raceEntries).where(eq(raceEntries.id, entryId));

  revalidatePath(`/admin/entries/${raceId}`);
  revalidatePath('/admin/entries');
}
