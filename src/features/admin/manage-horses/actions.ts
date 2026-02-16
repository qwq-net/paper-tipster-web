'use server';

import { auth } from '@/shared/config/auth';
import { HORSE_TAG_TYPES, HORSE_TYPES } from '@/shared/constants/horse';
import { db } from '@/shared/db';
import { horseTags, horses } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const horseSchema = z.object({
  name: z.string().min(1),
  gender: z.enum(['牡', '牝', 'セン']),
  age: z.coerce.number().min(2).max(20).optional(),
  origin: z.enum(['DOMESTIC', 'FOREIGN_BRED', 'FOREIGN_TRAINED']),
  notes: z.string().optional(),
  type: z.enum(HORSE_TYPES).default('REAL'),
  tags: z
    .string()
    .transform((str) => {
      try {
        return JSON.parse(str);
      } catch {
        return [];
      }
    })
    .pipe(z.array(z.object({ type: z.enum(HORSE_TAG_TYPES), content: z.string() })))
    .optional(),
});

const GENDER_MAP: Record<string, 'MARE' | 'FILLY' | 'HORSE' | 'COLT' | 'GELDING'> = {
  牡: 'HORSE',
  牝: 'MARE',
  セン: 'GELDING',
};

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
    type: formData.get('type') || 'REAL',
    tags: formData.get('tags') || '[]',
  });

  if (!parse.success) {
    console.error(parse.error);
    throw new Error('入力内容が無効です');
  }

  const genderInput = parse.data.gender as '牡' | '牝' | 'セン';
  const gender = GENDER_MAP[genderInput];

  const [horse] = await db
    .insert(horses)
    .values({
      name: parse.data.name,
      gender: gender,
      age: parse.data.age,
      origin: parse.data.origin,
      notes: parse.data.notes,
      type: parse.data.type,
    })
    .returning();

  if (parse.data.tags && parse.data.tags.length > 0) {
    await db.insert(horseTags).values(
      parse.data.tags.map((tag) => ({
        horseId: horse.id,
        type: tag.type,
        content: tag.content,
      }))
    );
  }

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
    type: formData.get('type') || 'REAL',
    tags: formData.get('tags') || '[]',
  });

  if (!parse.success) {
    console.error(parse.error);
    throw new Error('入力内容が無効です');
  }

  const genderInput = parse.data.gender as '牡' | '牝' | 'セン';
  const gender = GENDER_MAP[genderInput];

  await db.transaction(async (tx) => {
    await tx
      .update(horses)
      .set({
        name: parse.data.name,
        gender: gender,
        age: parse.data.age,
        origin: parse.data.origin,
        notes: parse.data.notes,
        type: parse.data.type,
      })
      .where(eq(horses.id, id));

    await tx.delete(horseTags).where(eq(horseTags.horseId, id));

    if (parse.data.tags && parse.data.tags.length > 0) {
      await tx.insert(horseTags).values(
        parse.data.tags.map((tag) => ({
          horseId: id,
          type: tag.type,
          content: tag.content,
        }))
      );
    }
  });

  revalidatePath('/admin/horses');
}

export async function getHorses() {
  return db.query.horses.findMany({
    with: {
      tags: true,
    },
    orderBy: (horses, { asc }) => [asc(horses.name)],
  });
}

export async function deleteHorse(id: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('認証されていません');
  }

  await db.delete(horses).where(eq(horses.id, id));

  revalidatePath('/admin/horses');
}

export async function getHorse(id: string) {
  const horse = await db.query.horses.findFirst({
    where: eq(horses.id, id),
    with: {
      tags: true,
    },
  });

  if (!horse) {
    throw new Error('指定された馬が見つかりません');
  }

  return horse;
}

export async function getHorseWins(horseId: string) {
  const [entries, manualWins] = await Promise.all([
    db.query.raceEntries.findMany({
      where: (entries, { and, eq }) => and(eq(entries.horseId, horseId), eq(entries.finishPosition, 1)),
      with: {
        race: {
          with: {
            definition: true,
            event: true,
          },
        },
      },
      orderBy: (entries, { desc }) => [desc(entries.createdAt)],
    }),
    db.query.horseWins.findMany({
      where: (wins, { eq }) => eq(wins.horseId, horseId),
      orderBy: (wins, { desc }) => [desc(wins.date)],
    }),
  ]);

  const winningHistory = [
    ...entries.map((win) => ({
      id: win.id,
      raceName: win.race.name,
      raceDate: win.race.date,
      grade: win.race.grade,
      surface: win.race.surface,
      distance: win.race.distance,
      eventId: win.race.eventId,
      eventName: win.race.event.name,
      type: 'RESULT' as const,
    })),
    ...manualWins.map((win) => ({
      id: win.id,
      raceName: win.title,
      raceDate: win.date || '',
      grade: null,
      surface: '',
      distance: 0,
      eventId: '',
      eventName: 'マスタ・称号',
      type: 'MANUAL' as const,
    })),
  ];

  return winningHistory.sort((a, b) => b.raceDate.localeCompare(a.raceDate));
}
