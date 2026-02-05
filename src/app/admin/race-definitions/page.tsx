import { CreateRaceDefinitionDialog } from '@/features/admin/manage-race-definitions/ui/create-race-definition-dialog';
import { RaceDefinitionList } from '@/features/admin/manage-race-definitions/ui/race-definition-list';
import { getVenues } from '@/features/admin/manage-venues/actions';
import { BookOpen } from 'lucide-react';
import { Suspense } from 'react';

export default async function RaceDefinitionsPage() {
  const venues = await getVenues();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <BookOpen className="h-8 w-8 text-gray-700" />
            レース定義（マスタ）管理
          </h1>
          <p className="mt-2 text-sm text-gray-500">毎年開催されるレースの基本情報（マスタデータ）を管理します。</p>
        </div>
        <CreateRaceDefinitionDialog
          venues={venues.map((v) => ({ id: v.id, name: v.name, defaultDirection: v.defaultDirection }))}
        />
      </div>

      <Suspense fallback={<div className="py-12 text-center text-gray-500">読み込み中...</div>}>
        <RaceDefinitionList />
      </Suspense>
    </div>
  );
}
