import { getRacesForSelect } from '@/features/admin/manage-entries';
import { Card } from '@/shared/ui';
import { Calendar, ChevronRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

async function RaceSelectList() {
  const races = await getRacesForSelect();

  if (races.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        登録可能なレースがありません。先にレースを登録してください。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {races.map((race) => (
        <Link
          key={race.id}
          href={`/admin/entries/${race.id}`}
          className="group flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-all hover:border-gray-300 hover:bg-gray-50"
        >
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="text-secondary font-semibold">{race.name}</div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{race.date.replace(/-/g, '/')}</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {race.location}
                </span>
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 transition-colors group-hover:text-gray-600" />
        </Link>
      ))}
    </div>
  );
}

export default function EntriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">出走馬管理</h1>
        <p className="mt-1 text-sm text-gray-500">レースを選択して出走馬を登録します</p>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">レース一覧</h2>
        <Suspense fallback={<div className="py-12 text-center text-gray-500">読み込み中...</div>}>
          <RaceSelectList />
        </Suspense>
      </Card>
    </div>
  );
}
