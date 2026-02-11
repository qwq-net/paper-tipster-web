import { updateSystemDefaultOdds } from '@/features/admin/manage-events/actions';
import { db } from '@/shared/db';
import { Card, CardContent, CardHeader } from '@/shared/ui';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { OddsForm } from './odds-form';

export default async function DefaultOddsSettingsPage() {
  const guaranteedOddsMaster = await db.query.guaranteedOddsMaster.findMany();

  const defaultOdds = guaranteedOddsMaster.reduce(
    (acc, item) => {
      acc[item.key] = Number(item.odds);
      return acc;
    },
    {} as Record<string, number>
  );

  async function updateOdds(formData: FormData) {
    'use server';
    const oddsStr = formData.get('odds');
    if (!oddsStr) return;

    const odds = JSON.parse(oddsStr.toString());
    await updateSystemDefaultOdds(odds);
    redirect('/admin');
  }

  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-6">
        <Link href="/admin" className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900">
          <ChevronLeft size={16} />
          ダッシュボードへ戻る
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">デフォルト保証オッズ設定</h1>
        <p className="mt-1 text-gray-500">システム全体のデフォルト保証オッズを設定します。</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">保証オッズ設定値</h2>
          <p className="text-sm text-gray-500">
            新規に作成されるレースに適用されるデフォルトの保証オッズを設定します。
            <br />※ 既に作成済みのレースの保証オッズは変更されません。個別に変更してください。
          </p>
        </CardHeader>
        <CardContent>
          <OddsForm initialOdds={defaultOdds} action={updateOdds} />
        </CardContent>
      </Card>
    </div>
  );
}
