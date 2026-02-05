'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { events } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { z } from 'zod';

const eventSchema = z.object({
  name: z.string().min(1, 'イベント名は必須です'),
  description: z.string().optional(),
  distributeAmount: z.coerce.number().min(0, '金額は0以上である必要があります'),
  date: z.string(),
});

export async function createEvent(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('認証されていません');
  }

  const parse = eventSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description')?.toString() || undefined,
    distributeAmount: formData.get('distributeAmount'),
    date: formData.get('date'),
  });

  if (!parse.success) {
    throw new Error('無効な入力です: ' + JSON.stringify(parse.error.flatten()));
  }

  await db.insert(events).values({
    name: parse.data.name,
    description: parse.data.description,
    distributeAmount: parse.data.distributeAmount,
    date: parse.data.date,
    status: 'SCHEDULED',
  });

  revalidatePath('/admin/events');
}

export async function updateEvent(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('認証されていません');
  }

  const parse = eventSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description')?.toString() || undefined,
    distributeAmount: formData.get('distributeAmount'),
    date: formData.get('date'),
  });

  if (!parse.success) {
    throw new Error('無効な入力です: ' + JSON.stringify(parse.error.flatten()));
  }

  await db
    .update(events)
    .set({
      name: parse.data.name,
      description: parse.data.description,
      distributeAmount: parse.data.distributeAmount,
      date: parse.data.date,
    })
    .where(eq(events.id, id));

  revalidatePath('/admin/events');
}

export async function updateEventStatus(eventId: string, newStatus: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED') {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('認証されていません');
  }

  await db.update(events).set({ status: newStatus }).where(eq(events.id, eventId));

  revalidatePath('/admin/events');
}

export async function deleteEvent(id: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('認証されていません');
  }

  // ON DELETE CASCADEの設定により、関連するwallets, racesなども削除される
  await db.delete(events).where(eq(events.id, id));

  revalidatePath('/admin/events');
}
