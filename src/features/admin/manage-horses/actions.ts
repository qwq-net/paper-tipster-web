'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { horses } from '@/shared/db/schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createHorseSchema = z.object({
  name: z.string().min(1),
  gender: z.enum(['牡', '牝', 'セン']),
  age: z.coerce.number().min(2).max(20).optional(),
  notes: z.string().optional(),
});

export async function createHorse(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const ageValue = formData.get('age');
  const notesValue = formData.get('notes');
  const parse = createHorseSchema.safeParse({
    name: formData.get('name'),
    gender: formData.get('gender'),
    age: ageValue && ageValue !== '' ? ageValue : undefined,
    notes: notesValue && notesValue !== '' ? notesValue : undefined,
  });

  if (!parse.success) {
    throw new Error('Invalid Input');
  }

  await db.insert(horses).values({
    name: parse.data.name,
    gender: parse.data.gender,
    age: parse.data.age,
    notes: parse.data.notes,
  });

  revalidatePath('/admin/horses');
}

export async function getHorses() {
  return db.select().from(horses).orderBy(horses.name);
}
