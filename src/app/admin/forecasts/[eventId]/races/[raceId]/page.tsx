import { getEntriesForRace, getRaceById } from '@/features/admin/manage-entries/actions';
import { getMyForecast } from '@/features/forecasts/actions';
import { ForecastInputForm } from '@/features/forecasts/components/ForecastInputForm';
import { Button } from '@/shared/ui/button';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ForecastInputPage({ params }: { params: Promise<{ eventId: string; raceId: string }> }) {
  const { eventId, raceId } = await params;

  const [race, entries, myForecast] = await Promise.all([
    getRaceById(raceId),
    getEntriesForRace(raceId),
    getMyForecast(raceId),
  ]);

  if (!race) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/forecasts`}>
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">予想入力</h1>
            <p className="text-sm text-gray-500">
              {race.name} ({race.raceNumber}R)
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href={`/races/${raceId}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            投票ページへ
          </Link>
        </Button>
      </div>

      <ForecastInputForm raceId={raceId} entries={entries} initialForecast={myForecast} />
    </div>
  );
}
