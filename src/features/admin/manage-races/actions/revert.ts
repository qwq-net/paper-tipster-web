'use server';

import { db } from '@/shared/db';
import { payoutResults, raceEntries, raceInstances } from '@/shared/db/schema';
import { requireAdmin } from '@/shared/utils/admin';
import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function resetRaceResults(raceId: string) {
  await requireAdmin();

  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${`payout:${raceId}`}))`);

    const race = await tx.query.raceInstances.findFirst({
      where: eq(raceInstances.id, raceId),
      columns: { id: true, status: true },
    });

    if (!race) throw new Error('レースが見つかりませんでした');
    if (race.status === 'FINALIZED') {
      throw new Error('確定済みのレースはリセットできません');
    }

    await tx.update(raceEntries).set({ finishPosition: null }).where(eq(raceEntries.raceId, raceId));

    await tx.delete(payoutResults).where(eq(payoutResults.raceId, raceId));
  });

  const { raceEventEmitter, RACE_EVENTS } = await import('@/shared/lib/sse/event-emitter');
  raceEventEmitter.emit(RACE_EVENTS.RACE_RESULT_UPDATED, {
    raceId,
    results: [],
    timestamp: Date.now(),
  });

  revalidatePath('/admin/races');
  revalidatePath(`/admin/races/${raceId}`);
  revalidatePath(`/races/${raceId}`);

  return { success: true };
}
