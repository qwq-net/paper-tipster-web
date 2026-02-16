'use server';

import { HorseTagType } from '@/entities/horse';
import { db } from '@/shared/db';
import { horseTagMaster } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getHorseTags() {
  return await db.query.horseTagMaster.findMany({
    orderBy: (t, { asc }) => [asc(t.type), asc(t.content)],
  });
}

export async function createHorseTag(formData: FormData) {
  const type = formData.get('type') as HorseTagType;
  const content = formData.get('content') as string;

  if (!type || !content) {
    throw new Error('Type and Content are required');
  }

  await db.insert(horseTagMaster).values({
    type,
    content,
  });

  revalidatePath('/admin/horse-tags');
}

export async function updateHorseTag(id: string, formData: FormData) {
  const type = formData.get('type') as HorseTagType;
  const content = formData.get('content') as string;

  if (!type || !content) {
    throw new Error('Type and Content are required');
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
  await db.delete(horseTagMaster).where(eq(horseTagMaster.id, id));
  revalidatePath('/admin/horse-tags');
}
