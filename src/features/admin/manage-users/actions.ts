'use server';

import { Role } from '@/entities/user';
import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { users } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, newRole: Role) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required.');
  }

  if (userId === session.user.id && newRole !== Role.ADMIN) {
    throw new Error('You cannot change your own role as an admin.');
  }

  await db.update(users).set({ role: newRole }).where(eq(users.id, userId));

  revalidatePath('/admin/users');
}

export async function toggleUserStatus(userId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required.');
  }

  if (userId === session.user.id) {
    throw new Error('You cannot disable your own account.');
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new Error('User not found.');
  }

  const newDisabledAt = user.disabledAt ? null : new Date();

  await db.update(users).set({ disabledAt: newDisabledAt }).where(eq(users.id, userId));

  revalidatePath('/admin/users');
}

export async function deleteUser(userId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required.');
  }

  if (userId === session.user.id) {
    throw new Error('You cannot delete your own account.');
  }

  await db.delete(users).where(eq(users.id, userId));

  revalidatePath('/admin/users');
}
