'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { guestCodes, users } from '@/shared/db/schema';
import crypto from 'crypto';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function generateGuestCode(title: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('認証されていません');
  }

  const code = crypto.randomBytes(8).toString('hex').toUpperCase();

  await db.insert(guestCodes).values({
    code,
    title,
    createdBy: session.user.id,
  });

  revalidatePath('/admin/users');
  return { success: true, code };
}

export async function getGuestCodes() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('認証されていません');
  }

  const codes = await db.query.guestCodes.findMany({
    orderBy: [desc(guestCodes.createdAt)],
    with: {
      creator: true,
    },
  });

  return codes;
}

export async function invalidateGuestCode(code: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('認証されていません');
  }

  await db.update(guestCodes).set({ disabledAt: new Date() }).where(eq(guestCodes.code, code));

  revalidatePath('/admin/users');
}

export async function invalidateUsersByCode(code: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('認証されていません');
  }

  await db.update(users).set({ disabledAt: new Date() }).where(eq(users.guestCodeId, code));

  revalidatePath('/admin/users');
}
