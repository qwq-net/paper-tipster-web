'use server';

import { db } from '@/shared/db';
import { users } from '@/shared/db/schema';
import { desc } from 'drizzle-orm';

export async function getUsers() {
  return db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
  });
}
