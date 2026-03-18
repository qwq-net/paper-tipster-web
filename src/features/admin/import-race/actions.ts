'use server';

import { db } from '@/shared/db';
import { horses, raceEntries, raceInstances, raceOdds } from '@/shared/db/schema';
import { requireAdmin } from '@/shared/utils/admin';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { parseShutuba } from './lib/parse-shutuba';
import type { HorsePreviewItem, RacePreviewWithHorseStatus } from './model/types';

const NETKEIBA_URL_RE = /^https:\/\/race\.netkeiba\.com\/race\/shutuba\.html\?race_id=(\d{12})$/;

async function fetchNetkeibaHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PaperTipster/1.0)' },
    signal: AbortSignal.timeout(10000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Netkeibaページの取得に失敗しました (${res.status})`);
  const buffer = await res.arrayBuffer();
  const contentType = res.headers.get('content-type') ?? '';
  const charsetMatch = contentType.match(/charset=([^\s;]+)/i);
  const charset = charsetMatch?.[1] ?? 'utf-8';
  return new TextDecoder(charset).decode(buffer);
}

export async function fetchRacePreview(url: string): Promise<RacePreviewWithHorseStatus> {
  await requireAdmin();
  if (!NETKEIBA_URL_RE.test(url)) throw new Error('URLの形式が正しくありません');

  const html = await fetchNetkeibaHtml(url);
  const preview = parseShutuba(html, url);

  const horseItems: HorsePreviewItem[] = await Promise.all(
    preview.horses.map(async (h) => {
      const existing = await db.query.horses.findFirst({
        where: eq(horses.name, h.name),
        columns: { id: true },
      });
      return { ...h, existingHorseId: existing?.id ?? null };
    })
  );

  return { raceInfo: preview.raceInfo, horses: horseItems, sourceUrl: preview.sourceUrl };
}

type ImportRaceParams = {
  url: string;
  eventId: string;
  venueId: string;
  date: string;
  raceName: string;
  raceNumber: number;
  distance: number;
  surface: string;
  direction: 'RIGHT' | 'LEFT' | null;
  condition: string | null;
  fixedOddsMode: boolean;
  horses: Array<{
    horseNumber: number;
    bracketNumber: number;
    name: string;
    gender: 'HORSE' | 'MARE' | 'GELDING';
    age: number | null;
    jockey: string | null;
    odds: number | null;
  }>;
};

export async function importRace(params: ImportRaceParams): Promise<{ raceId: string }> {
  await requireAdmin();

  if (!NETKEIBA_URL_RE.test(params.url)) throw new Error('URLの形式が正しくありません');
  if (params.horses.length === 0) throw new Error('出走馬が0頭です');

  const result = await db.transaction(async (tx) => {
    const horseIds: Record<number, string> = {};

    for (const horse of params.horses) {
      const existing = await tx.query.horses.findFirst({
        where: eq(horses.name, horse.name),
        columns: { id: true },
      });

      if (existing) {
        horseIds[horse.horseNumber] = existing.id;
      } else {
        const [inserted] = await tx
          .insert(horses)
          .values({ name: horse.name, gender: horse.gender, age: horse.age })
          .returning({ id: horses.id });
        horseIds[horse.horseNumber] = inserted.id;
      }
    }

    const [race] = await tx
      .insert(raceInstances)
      .values({
        eventId: params.eventId,
        venueId: params.venueId,
        date: params.date,
        name: params.raceName,
        raceNumber: params.raceNumber,
        distance: params.distance,
        surface: params.surface,
        direction: params.direction,
        condition: params.condition,
        status: 'SCHEDULED',
        netkeibaUrl: params.url,
        fixedOddsMode: params.fixedOddsMode,
      })
      .returning({ id: raceInstances.id });

    await tx.insert(raceEntries).values(
      params.horses.map((h) => ({
        raceId: race.id,
        horseId: horseIds[h.horseNumber],
        horseNumber: h.horseNumber,
        bracketNumber: h.bracketNumber,
        jockey: h.jockey,
      }))
    );

    const winOdds: Record<string, number> = {};
    for (const h of params.horses) {
      if (h.odds !== null) winOdds[String(h.horseNumber)] = h.odds;
    }
    await tx.insert(raceOdds).values({ raceId: race.id, winOdds, placeOdds: {} });

    return { raceId: race.id };
  });

  revalidatePath('/admin/races');
  return result;
}

export async function updateOddsFromNetkeiba(raceId: string): Promise<void> {
  await requireAdmin();

  const race = await db.query.raceInstances.findFirst({
    where: eq(raceInstances.id, raceId),
    columns: { netkeibaUrl: true },
  });
  if (!race?.netkeibaUrl) throw new Error('Netkeiba URLが設定されていません');

  const html = await fetchNetkeibaHtml(race.netkeibaUrl);
  const preview = parseShutuba(html, race.netkeibaUrl);

  const winOdds: Record<string, number> = {};
  for (const h of preview.horses) {
    if (h.odds !== null) winOdds[String(h.horseNumber)] = h.odds;
  }

  await db
    .insert(raceOdds)
    .values({ raceId, winOdds, placeOdds: {} })
    .onConflictDoUpdate({
      target: raceOdds.raceId,
      set: { winOdds, updatedAt: new Date() },
    });

  revalidatePath(`/admin/races/${raceId}`);
}
