import { getHorseTags } from '@/features/admin/manage-horse-tags/actions';
import { CreateHorseDialog, HorseList } from '@/features/admin/manage-horses';
import { Card } from '@/shared/ui';
import { Suspense } from 'react';

export default async function HorsesPage() {
  const tagOptions = await getHorseTags();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">馬管理</h1>
        <p className="mt-1 text-sm font-medium text-gray-500">競走馬の登録・管理を行います</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between px-2">
          <h2 className="text-xl font-semibold text-gray-900">登録済みの馬</h2>
          <CreateHorseDialog tagOptions={tagOptions} />
        </div>

        <Suspense fallback={<Card className="py-12 text-center font-semibold text-gray-500">読み込み中...</Card>}>
          <HorseList tagOptions={tagOptions} />
        </Suspense>
      </div>
    </div>
  );
}
