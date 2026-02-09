import { Bet5EventList } from '@/features/admin/bet5/ui/bet5-event-list';
import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { events } from '@/shared/db/schema';
import { desc } from 'drizzle-orm';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'BET5管理',
};

export default async function AdminBet5Page() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  const allEvents = await db.query.events.findMany({
    orderBy: [desc(events.createdAt)],
    with: {
      races: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">BET5管理</h1>
        <p className="mt-1 text-sm font-medium text-gray-500">BET5（5レース連続的中投票）のイベント設定を行います</p>
      </div>

      <div className="space-y-4">
        <Bet5EventList events={allEvents} />
      </div>
    </div>
  );
}
