import { RaceForm, RaceList } from '@/features/admin/manage-races';
import { Card } from '@/shared/ui';
import { Suspense } from 'react';

export default function RacesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">レース管理</h1>
        <p className="mt-1 text-sm text-gray-500">レースの登録・管理を行います</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">登録済みのレース</h2>
            <Suspense fallback={<div className="py-12 text-center text-gray-500">読み込み中...</div>}>
              <RaceList />
            </Suspense>
          </Card>
        </div>

        <div>
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">新規登録</h2>
            <RaceForm />
          </Card>
        </div>
      </div>
    </div>
  );
}
