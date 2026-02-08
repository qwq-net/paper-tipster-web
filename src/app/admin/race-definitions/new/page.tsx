import { RaceDefinitionForm } from '@/features/admin/manage-race-definitions/ui/race-definition-form';
import { getVenues } from '@/features/admin/manage-venues/actions';
import { Card } from '@/shared/ui';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function CreateRaceDefinitionPage() {
  const venues = await getVenues();

  async function onSuccess() {
    'use server';
    redirect('/admin/race-definitions');
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/race-definitions"
          className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft size={16} />
          一覧へ戻る
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">新規レース定義登録</h1>
        <p className="mt-1 text-gray-500">新しいレース定義（マスタ）を作成します。</p>
      </div>

      <Card className="p-6">
        <RaceDefinitionForm venues={venues} onSuccess={onSuccess} />
      </Card>
    </div>
  );
}
