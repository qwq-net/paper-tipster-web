'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { guaranteedOddsMaster } from '@/shared/db/schema';
import { sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateSystemDefaultOdds(defaultGuaranteedOdds: Record<string, number>) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('認証されていません');
  }

  const oddsEntries = Object.entries(defaultGuaranteedOdds)
    .filter(([, odds]) => Number.isFinite(odds) && odds >= 0)
    .map(([key, odds]) => ({ key, odds: odds.toString() }));

  if (oddsEntries.length > 0) {
    await db
      .insert(guaranteedOddsMaster)
      .values(oddsEntries)
      .onConflictDoUpdate({
        target: guaranteedOddsMaster.key,
        set: {
          odds: sql`excluded.odds`,
          updatedAt: new Date(),
        },
      });
  }

  revalidatePath('/admin/settings/odds');
}
