import { HorseForm, HorseList } from '@/features/admin/manage-horses';
import { Card } from '@/shared/ui';
import { Suspense } from 'react';

export default function HorsesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">馬管理</h1>
        <p className="mt-1 text-sm text-gray-500">競走馬の登録・管理を行います</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">登録済みの馬</h2>
            <Suspense fallback={<div className="py-12 text-center text-gray-500">読み込み中...</div>}>
              <HorseList />
            </Suspense>
          </Card>
        </div>

        <div>
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">新規登録</h2>
            <HorseForm />
          </Card>
        </div>
      </div>
    </div>
  );
}
