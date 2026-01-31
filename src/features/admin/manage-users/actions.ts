'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { users } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, newRole: 'USER' | 'ADMIN') {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required.');
  }

  if (userId === session.user.id && newRole !== 'ADMIN') {
  }

  await db.update(users).set({ role: newRole }).where(eq(users.id, userId));

  revalidatePath('/admin/users');
}
