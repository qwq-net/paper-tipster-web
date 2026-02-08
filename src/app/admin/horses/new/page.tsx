import { getHorseTags } from '@/features/admin/manage-horse-tags/actions';
import { HorseForm } from '@/features/admin/manage-horses/ui/horse-form';
import { Card } from '@/shared/ui';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function CreateHorsePage() {
  const tagOptions = await getHorseTags();

  async function onSuccess() {
    'use server';
    redirect('/admin/horses');
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/horses"
          className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft size={16} />
          一覧へ戻る
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">新規馬登録</h1>
        <p className="mt-1 text-gray-500">新しい競走馬の情報を入力してください。</p>
      </div>

      <Card className="p-6">
        <HorseForm tagOptions={tagOptions} onSuccess={onSuccess} />
      </Card>
    </div>
  );
}
