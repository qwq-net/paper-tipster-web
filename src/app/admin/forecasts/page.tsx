import { getRaces } from '@/features/admin/manage-races/actions/read';
import { ForecastRaceAccordion } from '@/features/forecasts/components/ForecastRaceAccordion';
import { Card } from '@/shared/ui/card';
import { CircleHelp } from 'lucide-react';
import { Suspense } from 'react';

export default async function ForecastsPage() {
  const races = await getRaces();

  type EventGroup = {
    id: string;
    name: string;
    date: string;
    status: string;
    races: typeof races;
  };

  const eventGroups = races.reduce<Record<string, EventGroup>>((acc, race) => {
    const eventId = race.event.id;
    if (!acc[eventId]) {
      acc[eventId] = {
        id: race.event.id,
        name: race.event.name,
        date: race.event.date,
        status: race.event.status,
        races: [],
      };
    }
    acc[eventId].races.push(race);
    return acc;
  }, {});

  const sortedEventGroups = Object.values(eventGroups).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">予想管理</h1>
        <p className="mt-1 text-sm text-gray-500">レースを選択して予想を入力してください</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">開催一覧</h2>
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
              <CircleHelp className="h-4 w-4 text-gray-500" />
              <span>レース名をクリックすると予想入力画面へ移動します。</span>
            </div>
          </div>
        </div>

        <Suspense fallback={<Card className="py-12 text-center text-gray-500">読み込み中...</Card>}>
          <ForecastRaceAccordion events={sortedEventGroups} />
        </Suspense>
      </div>
    </div>
  );
}
