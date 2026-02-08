import { CreateEventDialog, EventList } from '@/features/admin/manage-events';
import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { events } from '@/shared/db/schema';
import { desc } from 'drizzle-orm';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'イベント管理',
};

export default async function AdminEventsPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  const allEvents = await db.query.events.findMany({
    orderBy: [desc(events.createdAt)],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">イベント管理</h1>
        <p className="mt-1 text-sm font-medium text-gray-500">イベントの作成・ステータス管理を行います</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between px-2">
          <h2 className="text-xl font-semibold text-gray-900">すべてのイベント</h2>
          <CreateEventDialog />
        </div>

        <EventList events={allEvents} />
      </div>
    </div>
  );
}
