'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { payoutResults, raceEntries, races } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function resetRaceResults(raceId: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('認証されていません');

  const race = await db.query.races.findFirst({
    where: eq(races.id, raceId),
  });

  if (!race) throw new Error('レースが見つかりませんでした');
  if (race.status === 'FINALIZED') {
    throw new Error('確定済みのレースはリセットできません');
  }

  await db.transaction(async (tx) => {
    await tx.update(raceEntries).set({ finishPosition: null }).where(eq(raceEntries.raceId, raceId));

    await tx.delete(payoutResults).where(eq(payoutResults.raceId, raceId));
  });

  revalidatePath('/admin/races');
  revalidatePath(`/admin/races/${raceId}`);
  revalidatePath(`/races/${raceId}`);

  return { success: true };
}
