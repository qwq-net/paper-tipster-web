import { getGuestCodes } from '@/features/admin/guest-codes/actions/guest-actions';
import { GuestCodeManager } from '@/features/admin/guest-codes/ui/guest-code-manager';
import { ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ゲストユーザー管理',
};

export default async function GuestCodesPage() {
  const codes = await getGuestCodes();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/users"
          className="mb-4 flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft size={16} />
          ユーザー一覧に戻る
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">ゲストコード管理</h1>
        <p className="mt-1 text-sm text-gray-500">ゲストユーザー用のアクセスコードの発行と管理を行います。</p>
      </div>

      <GuestCodeManager codes={codes} />
    </div>
  );
}
