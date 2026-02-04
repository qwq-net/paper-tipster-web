'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { horses } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const horseSchema = z.object({
  name: z.string().min(1),
  gender: z.enum(['牡', '牝', 'セン']),
  age: z.coerce.number().min(2).max(20).optional(),
  origin: z.enum(['DOMESTIC', 'FOREIGN_BRED', 'FOREIGN_TRAINED']),
  notes: z.string().optional(),
});

export async function createHorse(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('認証されていません');
  }

  const ageValue = formData.get('age');
  const notesValue = formData.get('notes');
  const parse = horseSchema.safeParse({
    name: formData.get('name'),
    gender: formData.get('gender'),
    age: ageValue && ageValue !== '' ? ageValue : undefined,
    origin: formData.get('origin'),
    notes: notesValue && notesValue !== '' ? notesValue : undefined,
  });

  if (!parse.success) {
    console.error(parse.error);
    throw new Error('入力内容が無効です');
  }

  await db.insert(horses).values({
    name: parse.data.name,
    gender: parse.data.gender,
    age: parse.data.age,
    origin: parse.data.origin,
    notes: parse.data.notes,
  });

  revalidatePath('/admin/horses');
}

export async function updateHorse(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('認証されていません');
  }

  const ageValue = formData.get('age');
  const notesValue = formData.get('notes');
  const parse = horseSchema.safeParse({
    name: formData.get('name'),
    gender: formData.get('gender'),
    age: ageValue && ageValue !== '' ? ageValue : undefined,
    origin: formData.get('origin'),
    notes: notesValue && notesValue !== '' ? notesValue : undefined,
  });

  if (!parse.success) {
    console.error(parse.error);
    throw new Error('入力内容が無効です');
  }

  await db
    .update(horses)
    .set({
      name: parse.data.name,
      gender: parse.data.gender,
      age: parse.data.age,
      origin: parse.data.origin,
      notes: parse.data.notes,
    })
    .where(eq(horses.id, id));

  revalidatePath('/admin/horses');
}

export async function getHorses() {
  return db.select().from(horses).orderBy(horses.name);
}

export async function deleteHorse(id: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('認証されていません');
  }

  await db.delete(horses).where(eq(horses.id, id));

  revalidatePath('/admin/horses');
}
