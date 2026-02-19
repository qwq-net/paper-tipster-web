import { getRacesForSelect } from '@/features/admin/manage-entries';
import { EntryRaceAccordion } from '@/features/admin/manage-entries/ui/entry-race-accordion';
import { Card } from '@/shared/ui';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: '出走馬管理',
};

async function RaceSelectList() {
  const events = await getRacesForSelect();

  return <EntryRaceAccordion events={events} />;
}

export default function EntriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">出走馬管理</h1>
        <p className="mt-1 text-sm text-gray-500">レースを選択して出走馬を登録します</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">登録可能なレース</h2>
          </div>
        </div>

        <Suspense fallback={<Card className="py-12 text-center text-gray-500">読み込み中...</Card>}>
          <RaceSelectList />
        </Suspense>
      </div>
    </div>
  );
}
