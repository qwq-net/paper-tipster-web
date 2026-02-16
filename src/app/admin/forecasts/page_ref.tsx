import { getRaces } from '@/features/admin/manage-races/actions/read';
import { RaceAccordion } from '@/features/admin/manage-races/ui/race-accordion';
import { Button, Card } from '@/shared/ui';
import { CircleHelp, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'レース管理',
};

export default async function RacesPage() {
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
        <h1 className="text-2xl font-semibold text-gray-900">レース管理</h1>
        <p className="mt-1 text-sm text-gray-500">レースの登録・管理を行います</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">登録済みのレース</h2>
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
              <CircleHelp className="h-4 w-4 text-gray-500" />
              <span>レースの締め切りや払い戻し確定操作は レースタイトルのリンク先から行えます。</span>
            </div>
          </div>
          <Button
            asChild
            className="flex items-center gap-2 font-semibold shadow-sm transition-all hover:shadow-md active:scale-95"
          >
            <Link href="/admin/races/new">
              <Plus className="h-4 w-4" />
              新規レース追加
            </Link>
          </Button>
        </div>

        <Suspense fallback={<Card className="py-12 text-center text-gray-500">読み込み中...</Card>}>
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
            <RaceAccordion events={sortedEventGroups} />
          </div>
        </Suspense>
      </div>
    </div>
  );
}
