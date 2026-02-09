import { Bet5ConfigForm } from '@/features/admin/bet5/ui/bet5-config-form';
import { Bet5ManageCard } from '@/features/admin/bet5/ui/bet5-manage-card';
import { db } from '@/shared/db';
import { bet5Events, events, raceInstances } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function Bet5AdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch Event
  const event = await db.query.events.findFirst({
    where: eq(events.id, id),
  });

  if (!event) {
    notFound();
  }

  // 2. Fetch Races for this event
  const races = await db.query.raceInstances.findMany({
    where: eq(raceInstances.eventId, id),
    orderBy: (raceInstances, { asc }) => [asc(raceInstances.raceNumber)],
  });

  // 3. Fetch Existing BET5 Event
  const bet5Event = await db.query.bet5Events.findFirst({
    where: eq(bet5Events.eventId, id),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/admin/events/${id}`}
          className="mb-4 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          イベント編集に戻る
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">BET5 管理</h1>
        <p className="mt-1 text-sm text-gray-500">{event.name} のBET5設定</p>
      </div>

      {!bet5Event ? (
        <Bet5ConfigForm eventId={id} races={races} />
      ) : (
        <Bet5ManageCard bet5Event={bet5Event} eventId={id} />
      )}
    </div>
  );
}
