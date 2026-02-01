'use server';

import { db } from '@/shared/db';
import { races } from '@/shared/db/schema';
import { desc } from 'drizzle-orm';

export async function getRaces() {
  return db.select().from(races).orderBy(desc(races.date), races.name);
}
