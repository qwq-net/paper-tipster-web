import { RaceDefinitionList } from '@/features/admin/manage-race-definitions/ui/race-definition-list';
import { Button, Card } from '@/shared/ui';
import { Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'レース定義',
};

export default async function RaceDefinitionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">レース定義（マスタ）管理</h1>
        <p className="mt-1 text-sm text-gray-500">毎年開催されるレースの基本情報（マスタデータ）を管理します。</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between px-2">
          <h2 className="text-xl font-semibold text-gray-900">登録済みのレース定義</h2>
          <Button
            asChild
            className="flex items-center gap-2 font-semibold shadow-sm transition-all hover:shadow-md active:scale-95"
          >
            <Link href="/admin/race-definitions/new">
              <Plus className="h-4 w-4" />
              新規登録
            </Link>
          </Button>
        </div>

        <Suspense fallback={<Card className="py-12 text-center text-gray-500">読み込み中...</Card>}>
          <RaceDefinitionList />
        </Suspense>
      </div>
    </div>
  );
}
