'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { races } from '@/shared/db/schema';
import { parseJSTToUTC } from '@/shared/utils/date';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { raceSchema } from '../model/schema';

export async function updateRace(id: string, formData: FormData) {
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

  const now = new Date();
  const newClosingAt = parse.data.closingAt ? parseJSTToUTC(parse.data.closingAt) : null;

  await db.transaction(async (tx) => {
    const race = await tx.query.races.findFirst({
      where: eq(races.id, id),
    });

    if (!race) throw new Error('レースが見つかりませんでした');

    let newStatus = race.status;
    if (race.status === 'CLOSED' && newClosingAt && newClosingAt > now) {
      newStatus = 'SCHEDULED';
    }

    await tx
      .update(races)
      .set({
        eventId: parse.data.eventId,
        date: parse.data.date,
        location: parse.data.location,
        name: parse.data.name,
        raceNumber: parse.data.raceNumber,
        distance: parse.data.distance,
        surface: parse.data.surface,
        condition: parse.data.condition,
        closingAt: newClosingAt,
        status: newStatus,
      })
      .where(eq(races.id, id));
  });

  revalidatePath('/admin/races');
  revalidatePath(`/admin/races/${id}`);
}

export async function closeRace(raceId: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  await db.update(races).set({ status: 'CLOSED' }).where(eq(races.id, raceId));

  const { raceEventEmitter, RACE_EVENTS } = await import('@/lib/sse/event-emitter');
  raceEventEmitter.emit(RACE_EVENTS.RACE_CLOSED, { raceId, timestamp: Date.now() });

  revalidatePath('/admin/races');
  revalidatePath(`/admin/races/${raceId}`);
  revalidatePath(`/races/${raceId}`);
  return { success: true };
}

export async function reopenRace(raceId: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  await db.update(races).set({ status: 'SCHEDULED', closingAt: null }).where(eq(races.id, raceId));

  const { raceEventEmitter, RACE_EVENTS } = await import('@/lib/sse/event-emitter');
  raceEventEmitter.emit(RACE_EVENTS.RACE_REOPENED, { raceId, timestamp: Date.now() });

  revalidatePath('/admin/races');
  revalidatePath(`/admin/races/${raceId}`);
  revalidatePath(`/races/${raceId}`);
  return { success: true };
}

export async function setClosingTime(raceId: string, minutes: number) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  const closingAt = new Date(Date.now() + minutes * 60 * 1000);

  await db.update(races).set({ closingAt, status: 'SCHEDULED' }).where(eq(races.id, raceId));

  const { raceEventEmitter, RACE_EVENTS } = await import('@/lib/sse/event-emitter');
  raceEventEmitter.emit(RACE_EVENTS.RACE_REOPENED, { raceId, timestamp: Date.now() });

  revalidatePath('/admin/races');
  revalidatePath(`/admin/races/${raceId}`);
  revalidatePath(`/races/${raceId}`);

  return { success: true, closingAt };
}
