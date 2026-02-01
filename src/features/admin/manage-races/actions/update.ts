'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { races } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { raceSchema } from '../model/schema';

export async function updateRace(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const conditionValue = formData.get('condition');
  const closingAtValue = formData.get('closingAt');

  const parse = raceSchema.safeParse({
    date: formData.get('date'),
    location: formData.get('location'),
    name: formData.get('name'),
    distance: formData.get('distance'),
    surface: formData.get('surface'),
    condition: conditionValue && conditionValue !== '' ? conditionValue : undefined,
    closingAt: closingAtValue && closingAtValue !== '' ? closingAtValue : undefined,
  });

  if (!parse.success) {
    throw new Error('Invalid Input');
  }

  await db
    .update(races)
    .set({
      date: parse.data.date,
      location: parse.data.location,
      name: parse.data.name,
      distance: parse.data.distance,
      surface: parse.data.surface,
      condition: parse.data.condition,
      closingAt: parse.data.closingAt ? new Date(parse.data.closingAt) : null,
    })
    .where(eq(races.id, id));

  revalidatePath('/admin/races');
  revalidatePath(`/admin/races/${id}`);
}

export async function closeRace(raceId: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  await db.update(races).set({ status: 'CLOSED' }).where(eq(races.id, raceId));

  // SSEイベントの発行（サーバーサイド）
  const { raceEventEmitter, RACE_EVENTS } = await import('@/lib/sse/event-emitter');
  raceEventEmitter.emit(RACE_EVENTS.RACE_CLOSED, { raceId, timestamp: Date.now() });

  revalidatePath('/admin/races');
  revalidatePath(`/admin/races/${raceId}`);
  revalidatePath(`/races/${raceId}`);
  return { success: true };
}
