'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { races } from '@/shared/db/schema';
import { parseJSTToUTC } from '@/shared/utils/date';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { raceSchema } from '../model/schema';

export async function createRace(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('認証されていません');
  }

  const conditionValue = formData.get('condition');
  const closingAtValue = formData.get('closingAt');

  const parse = raceSchema.safeParse({
    eventId: formData.get('eventId'),
    date: formData.get('date'),
    location: formData.get('location'),
    name: formData.get('name'),
    raceNumber: formData.get('raceNumber') || undefined,
    distance: formData.get('distance'),
    surface: formData.get('surface'),
    condition: conditionValue && conditionValue !== '' ? conditionValue : undefined,
    closingAt: closingAtValue && closingAtValue !== '' ? closingAtValue : undefined,
  });

  if (!parse.success) {
    console.error('Validation Error Details:', parse.error.format());
    throw new Error('入力内容が無効です');
  }

  let raceNumber = parse.data.raceNumber;
  if (!raceNumber) {
    const existingRaces = await db.query.races.findMany({
      where: eq(races.eventId, parse.data.eventId),
      columns: { raceNumber: true },
    });
    const maxNumber = existingRaces.reduce((max, race) => Math.max(max, race.raceNumber || 0), 0);
    raceNumber = maxNumber + 1;
  }

  await db.insert(races).values({
    eventId: parse.data.eventId,
    date: parse.data.date,
    location: parse.data.location,
    name: parse.data.name,
    raceNumber,
    distance: parse.data.distance,
    surface: parse.data.surface,
    condition: parse.data.condition,
    closingAt: parse.data.closingAt ? parseJSTToUTC(parse.data.closingAt) : null,
  });

  revalidatePath('/admin/races');
}
