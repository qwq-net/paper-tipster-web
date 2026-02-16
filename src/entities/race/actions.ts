'use server';

import { db } from '@/shared/db';
import { payoutResults as payoutResultsTable } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';

export async function getPayoutResults(raceId: string) {
  return db.select().from(payoutResultsTable).where(eq(payoutResultsTable.raceId, raceId));
}
