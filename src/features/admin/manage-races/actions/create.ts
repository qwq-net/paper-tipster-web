'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { raceInstances } from '@/shared/db/schema';
import { parseJSTToUTC } from '@/shared/utils/date';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { raceSchema } from '../model/validation';

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
    venueId: formData.get('venueId'),
    raceDefinitionId: formData.get('raceDefinitionId') || undefined,
    direction: formData.get('direction') || undefined,
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
    const existingRaces = await db.query.raceInstances.findMany({
      where: eq(raceInstances.eventId, parse.data.eventId),
      columns: { raceNumber: true },
    });
    const maxNumber = existingRaces.reduce((max, race) => Math.max(max, race.raceNumber || 0), 0);
    raceNumber = maxNumber + 1;
  }

  const venueId = formData.get('venueId') as string;
  const eventId = formData.get('eventId') as string;

  const venue = await db.query.venues.findFirst({
    where: eq(raceInstances.venueId, venueId),
    columns: { shortName: true },
  });

  await db.insert(raceInstances).values({
    eventId,
    date: formData.get('date') as string,
    venueId,
    location: venue?.shortName || null,
    raceDefinitionId: (formData.get('raceDefinitionId') as string) || null,
    name: formData.get('name') as string,
    raceNumber,
    distance: parseInt(formData.get('distance') as string),
    surface: formData.get('surface') as string,
    condition: (formData.get('condition') as string) || null,
    direction: parse.data.direction,
    closingAt: parse.data.closingAt ? parseJSTToUTC(parse.data.closingAt) : null,
    status: 'SCHEDULED',
  });

  revalidatePath('/admin/races');
}
