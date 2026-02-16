'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { guaranteedOddsMaster } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateSystemDefaultOdds(defaultGuaranteedOdds: Record<string, number>) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('認証されていません');
  }

  for (const [key, odds] of Object.entries(defaultGuaranteedOdds)) {
    const existing = await db.query.guaranteedOddsMaster.findFirst({
      where: (t, { eq }) => eq(t.key, key),
    });

    if (existing) {
      await db.update(guaranteedOddsMaster).set({ odds: odds.toString() }).where(eq(guaranteedOddsMaster.key, key));
    } else {
      await db.insert(guaranteedOddsMaster).values({
        key,
        odds: odds.toString(),
      });
    }
  }

  revalidatePath('/admin/settings/odds');
}
