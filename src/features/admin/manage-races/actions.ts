'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { races } from '@/shared/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const raceSchema = z.object({
  date: z.string().min(1),
  location: z.string().min(1),
  name: z.string().min(1),
  distance: z.coerce.number().min(100),
  surface: z.enum(['芝', 'ダート']),
  condition: z.enum(['良', '稍重', '重', '不良']).optional(),
});

export async function createRace(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const conditionValue = formData.get('condition');
  const parse = raceSchema.safeParse({
    date: formData.get('date'),
    location: formData.get('location'),
    name: formData.get('name'),
    distance: formData.get('distance'),
    surface: formData.get('surface'),
    condition: conditionValue && conditionValue !== '' ? conditionValue : undefined,
  });

  if (!parse.success) {
    throw new Error('Invalid Input');
  }

  await db.insert(races).values({
    date: parse.data.date,
    location: parse.data.location,
    name: parse.data.name,
    distance: parse.data.distance,
    surface: parse.data.surface,
    condition: parse.data.condition,
  });

  revalidatePath('/admin/races');
}

export async function updateRace(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const conditionValue = formData.get('condition');
  const parse = raceSchema.safeParse({
    date: formData.get('date'),
    location: formData.get('location'),
    name: formData.get('name'),
    distance: formData.get('distance'),
    surface: formData.get('surface'),
    condition: conditionValue && conditionValue !== '' ? conditionValue : undefined,
  });

  if (!parse.success) {
    throw new Error('Invalid Input');
  }

  await db
    .update(races)
    .set({
      date: parse.data.date,
      location: parse.data.location,
      name: parse.data.name,
      distance: parse.data.distance,
      surface: parse.data.surface,
      condition: parse.data.condition,
    })
    .where(eq(races.id, id));

  revalidatePath('/admin/races');
}

export async function getRaces() {
  return db.select().from(races).orderBy(desc(races.date), races.name);
}
