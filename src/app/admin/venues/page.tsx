import { VenueList } from '@/features/admin/manage-venues/ui/venue-list';
import { auth } from '@/shared/config/auth';
import { Button } from '@/shared/ui';
import { Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: '競馬場管理',
};

export default async function AdminVenuesPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">開催会場管理</h2>
        <Button asChild className="gap-2">
          <Link href="/admin/venues/new">
            <Plus className="h-4 w-4" />
            新規登録
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div className="text-center text-gray-500">読み込み中...</div>}>
        <VenueList />
      </Suspense>
    </div>
  );
}
