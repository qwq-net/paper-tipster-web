import { EntryDnd, getAvailableHorses, getEntriesForRace, getRaceById } from '@/features/admin/manage-entries';
import { Card } from '@/shared/ui';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: '出走馬詳細',
};

type Props = {
  params: Promise<{ raceId: string }>;
};

export default async function RaceEntryPage({ params }: Props) {
  const { raceId } = await params;
  const race = await getRaceById(raceId);

  if (!race) {
    notFound();
  }

  const [availableHorses, existingEntries] = await Promise.all([getAvailableHorses(raceId), getEntriesForRace(raceId)]);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Link
          href="/admin/entries"
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
            <p>
              {race.date.replace(/-/g, '/')} @ {race.venue?.name}
            </p>
            <span className="bg-secondary/10 text-secondary rounded-sm px-1.5 py-0.5 text-sm font-semibold">
              {race.raceNumber}R
            </span>
            <span className="ml-1 text-gray-400">/</span>
            <span className="truncate">{race.event.name}</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{race.name}</h1>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{race.event.name}</span>
            <span>•</span>
            <span>{race.venue?.shortName}</span>
            <span className="text-gray-300">•</span>
            <span>{race.distance}m</span>
            <span className="text-gray-300">•</span>
            <span>{existingEntries.length}頭</span>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <EntryDnd raceId={raceId} availableHorses={availableHorses} existingEntries={existingEntries} />
      </Card>
    </div>
  );
}
