import { RaceDefinitionList } from '@/features/admin/manage-race-definitions/ui/race-definition-list';
import { Button } from '@/shared/ui';
import { BookOpen, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'レース定義',
};

export default async function RaceDefinitionsPage() {
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
        <Button
          asChild
          className="from-primary to-primary/80 hover:to-primary bg-linear-to-r shadow-md transition-all hover:shadow-lg"
        >
          <Link href="/admin/race-definitions/new">
            <Plus className="mr-2 -ml-1 h-4 w-4" />
            新規登録
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div className="py-12 text-center text-gray-500">読み込み中...</div>}>
        <RaceDefinitionList />
      </Suspense>
    </div>
  );
}
