'use server';

import { HorseTagType } from '@/entities/horse';
import { db } from '@/shared/db';
import { horseTagMaster } from '@/shared/db/schema';
import { requireAdmin } from '@/shared/utils/admin';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getHorseTags() {
  await requireAdmin();

  return await db.query.horseTagMaster.findMany({
    orderBy: (t, { asc }) => [asc(t.type), asc(t.content)],
  });
}

export async function createHorseTag(formData: FormData) {
  await requireAdmin();

  const type = formData.get('type') as HorseTagType;
  const content = formData.get('content') as string;

  if (!type || !content) {
    throw new Error('入力内容が無効です');
  }

  await db.insert(horseTagMaster).values({
    type,
    content,
  });

  revalidatePath('/admin/horse-tags');
}

export async function updateHorseTag(id: string, formData: FormData) {
  await requireAdmin();

  const type = formData.get('type') as HorseTagType;
  const content = formData.get('content') as string;

  if (!type || !content) {
    throw new Error('入力内容が無効です');
  }

  await db
    .update(horseTagMaster)
    .set({
      type,
      content,
    })
    .where(eq(horseTagMaster.id, id));

  revalidatePath('/admin/horse-tags');
}

export async function deleteHorseTag(id: string) {
  await requireAdmin();

  await db.delete(horseTagMaster).where(eq(horseTagMaster.id, id));
  revalidatePath('/admin/horse-tags');
}
