'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { users } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const VALID_NAME_REGEX = /^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/;

export async function updateUserOnboarding(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;

  if (!name || !VALID_NAME_REGEX.test(name)) {
    return { error: 'Invalid name. Only alphanumeric, Hiragana, Katakana, and Kanji are allowed.' };
  }

  try {
    await db
      .update(users)
      .set({
        name: name,
        isOnboardingCompleted: true,
      })
      .where(eq(users.id, session.user.id));
  } catch (error) {
    console.error('Failed to update user:', error);
    return { error: 'Failed to update user. Please try again.' };
  }

  revalidatePath('/mypage');
  redirect('/mypage');
}

export async function updateUserName(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;

  if (!name || !VALID_NAME_REGEX.test(name)) {
    return { error: 'Invalid name. Only alphanumeric, Hiragana, Katakana, and Kanji are allowed.' };
  }

  try {
    await db
      .update(users)
      .set({
        name: name,
      })
      .where(eq(users.id, session.user.id));
  } catch (error) {
    console.error('Failed to update user:', error);
    return { error: 'Failed to update user. Please try again.' };
  }

  revalidatePath('/mypage');
  return { success: true };
}
