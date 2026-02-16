'use server';

import { db } from '@/shared/db';
import { raceInstances } from '@/shared/db/schema';
import { ADMIN_ERRORS, requireAdmin, revalidateRacePaths } from '@/shared/utils/admin';
import { parseJSTToUTC } from '@/shared/utils/date';
import { eq } from 'drizzle-orm';
import { raceSchema } from '../model/validation';

export async function updateRace(id: string, formData: FormData) {
  await requireAdmin();

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
    throw new Error(ADMIN_ERRORS.INVALID_INPUT);
  }

  const now = new Date();
  const newClosingAt = parse.data.closingAt ? parseJSTToUTC(parse.data.closingAt) : null;

  await db.transaction(async (tx) => {
    const race = await tx.query.raceInstances.findFirst({
      where: eq(raceInstances.id, id),
    });

    if (!race) throw new Error(ADMIN_ERRORS.NOT_FOUND);

    let newStatus = race.status;
    if (race.status === 'CLOSED' && newClosingAt && newClosingAt > now) {
      newStatus = 'SCHEDULED';
    }

    await tx
      .update(raceInstances)
      .set({
        eventId: parse.data.eventId,
        date: parse.data.date,
        venueId: parse.data.venueId,

        raceDefinitionId: parse.data.raceDefinitionId,
        direction: parse.data.direction,
        name: parse.data.name,
        raceNumber: parse.data.raceNumber,
        distance: parse.data.distance,
        surface: parse.data.surface,
        condition: parse.data.condition,
        closingAt: newClosingAt,
        status: newStatus,
      })
      .where(eq(raceInstances.id, id));
  });

  revalidateRacePaths(id);
}

export async function closeRace(raceId: string) {
  await requireAdmin();

  await db.update(raceInstances).set({ status: 'CLOSED' }).where(eq(raceInstances.id, raceId));

  const { raceEventEmitter, RACE_EVENTS } = await import('@/shared/lib/sse/event-emitter');
  raceEventEmitter.emit(RACE_EVENTS.RACE_CLOSED, { raceId, timestamp: Date.now() });

  revalidateRacePaths(raceId);
  return { success: true };
}

export async function reopenRace(raceId: string) {
  await requireAdmin();

  await db.update(raceInstances).set({ status: 'SCHEDULED', closingAt: null }).where(eq(raceInstances.id, raceId));

  const { raceEventEmitter, RACE_EVENTS } = await import('@/shared/lib/sse/event-emitter');
  raceEventEmitter.emit(RACE_EVENTS.RACE_REOPENED, { raceId, timestamp: Date.now() });

  revalidateRacePaths(raceId);
  return { success: true };
}

export async function setClosingTime(raceId: string, minutes: number) {
  await requireAdmin();

  const closingAt = new Date(Date.now() + minutes * 60 * 1000);

  await db.update(raceInstances).set({ closingAt, status: 'SCHEDULED' }).where(eq(raceInstances.id, raceId));

  const { raceEventEmitter, RACE_EVENTS } = await import('@/shared/lib/sse/event-emitter');
  raceEventEmitter.emit(RACE_EVENTS.RACE_REOPENED, { raceId, timestamp: Date.now() });

  revalidateRacePaths(raceId);

  return { success: true, closingAt };
}
