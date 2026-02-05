'use server';

import { auth } from '@/shared/config/auth';
import { VENUE_AREAS, VENUE_DIRECTIONS } from '@/shared/constants/race';
import { db } from '@/shared/db';
import { venues } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const venueSchema = z.object({
  name: z.string().min(1, '会場名は必須です'),
  shortName: z.string().min(1, '略称は必須です').max(3, '略称は3文字以内で入力してください'),
  code: z.string().optional(),
  direction: z.enum(VENUE_DIRECTIONS),
  area: z.enum(VENUE_AREAS),
});

export async function createVenue(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('認証されていません');
  }

  const parse = venueSchema.safeParse({
    name: formData.get('name'),
    shortName: formData.get('shortName'),
    code: formData.get('code'),
    direction: formData.get('direction'),
    area: formData.get('area'),
  });

  if (!parse.success) {
    throw new Error('入力内容が無効です');
  }

  await db.insert(venues).values({
    name: parse.data.name,
    shortName: parse.data.shortName,
    code: parse.data.code,
    defaultDirection: parse.data.direction,
    area: parse.data.area,
  });

  revalidatePath('/admin/venues');
}

export async function updateVenue(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('認証されていません');
  }

  const parse = venueSchema.safeParse({
    name: formData.get('name'),
    shortName: formData.get('shortName'),
    code: formData.get('code'),
    direction: formData.get('direction'),
    area: formData.get('area'),
  });

  if (!parse.success) {
    throw new Error('入力内容が無効です');
  }

  await db
    .update(venues)
    .set({
      name: parse.data.name,
      shortName: parse.data.shortName,
      code: parse.data.code,
      defaultDirection: parse.data.direction,
      area: parse.data.area,
    })
    .where(eq(venues.id, id));

  revalidatePath('/admin/venues');
}

export async function deleteVenue(id: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('認証されていません');
  }

  await db.delete(venues).where(eq(venues.id, id));

  revalidatePath('/admin/venues');
}

export async function getVenues() {
  return db.select().from(venues).orderBy(venues.code, venues.name);
}
