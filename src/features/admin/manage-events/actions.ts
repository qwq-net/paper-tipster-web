'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { events } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { z } from 'zod';

const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  description: z.string().optional(),
  distributeAmount: z.coerce.number().min(0, 'Amount must be positive'),
  date: z.string(),
});

export async function createEvent(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const parse = eventSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description')?.toString() || undefined,
    distributeAmount: formData.get('distributeAmount'),
    date: formData.get('date'),
  });

  if (!parse.success) {
    throw new Error('Invalid Input: ' + JSON.stringify(parse.error.flatten()));
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
    throw new Error('Unauthorized');
  }

  const parse = eventSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description')?.toString() || undefined,
    distributeAmount: formData.get('distributeAmount'),
    date: formData.get('date'),
  });

  if (!parse.success) {
    throw new Error('Invalid Input: ' + JSON.stringify(parse.error.flatten()));
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
    throw new Error('Unauthorized');
  }

  await db.update(events).set({ status: newStatus }).where(eq(events.id, eventId));

  revalidatePath('/admin/events');
}
