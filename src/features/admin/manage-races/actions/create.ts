'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { races } from '@/shared/db/schema';
import { revalidatePath } from 'next/cache';
import { raceSchema } from '../model/schema';

export async function createRace(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const conditionValue = formData.get('condition');
  const closingAtValue = formData.get('closingAt');

  const parse = raceSchema.safeParse({
    date: formData.get('date'),
    location: formData.get('location'),
    name: formData.get('name'),
    distance: formData.get('distance'),
    surface: formData.get('surface'),
    condition: conditionValue && conditionValue !== '' ? conditionValue : undefined,
    closingAt: closingAtValue && closingAtValue !== '' ? closingAtValue : undefined,
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
    closingAt: parse.data.closingAt ? new Date(parse.data.closingAt) : null,
  });

  revalidatePath('/admin/races');
}
