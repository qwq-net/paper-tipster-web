import { getGuestCodes } from '@/features/admin/guest-codes/actions/guest-actions';
import { GuestCodeManager } from '@/features/admin/guest-codes/ui/guest-code-manager';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function GuestCodesPage() {
  const codes = await getGuestCodes();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/users"
          className="mb-4 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          ユーザー一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">ゲストコード管理</h1>
        <p className="mt-1 text-gray-500">ゲストユーザー用のアクセスコードの発行と管理を行います。</p>
      </div>

      <GuestCodeManager codes={codes} />
    </div>
  );
}
