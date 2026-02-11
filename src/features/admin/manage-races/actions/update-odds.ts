'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { raceInstances } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateGuaranteedOdds(raceId: string, guaranteedOdds: Record<string, number>) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  await db.update(raceInstances).set({ guaranteedOdds }).where(eq(raceInstances.id, raceId));

  revalidatePath(`/admin/races/${raceId}`);
  revalidatePath(`/admin/races/${raceId}/odds`);
}
