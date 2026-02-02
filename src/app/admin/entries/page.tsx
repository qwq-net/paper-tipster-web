import { getRacesForSelect } from '@/features/admin/manage-entries';
import { EntryRaceAccordion } from '@/features/admin/manage-entries/ui/entry-race-accordion';
import { Card } from '@/shared/ui';
import { Suspense } from 'react';

async function RaceSelectList() {
  const events = await getRacesForSelect();

  return <EntryRaceAccordion events={events} />;
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
