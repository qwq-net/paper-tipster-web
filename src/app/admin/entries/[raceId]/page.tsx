import { EntryDnd, getAvailableHorses, getEntriesForRace, getRaceById } from '@/features/admin/manage-entries';
import { Card } from '@/shared/ui';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
      <div className="flex items-center gap-4">
        <Link
          href="/admin/entries"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{race.name}</h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {race.date.replace(/-/g, '/')}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {race.location}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                race.surface === '芝' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {race.surface} {race.distance}m
            </span>
            {race.condition && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  race.condition === '良'
                    ? 'bg-sky-100 text-sky-800'
                    : race.condition === '稍重'
                      ? 'bg-cyan-100 text-cyan-800'
                      : race.condition === '重'
                        ? 'bg-slate-200 text-slate-800'
                        : 'bg-gray-300 text-gray-800'
                }`}
              >
                {race.condition}
              </span>
            )}
          </div>
        </div>
      </div>

      <Card className="p-6">
        <EntryDnd raceId={raceId} availableHorses={availableHorses} existingEntries={existingEntries} />
      </Card>
    </div>
  );
}
