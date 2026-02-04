import { EventClaimList } from '@/features/economy/claim';
import { getEventWallets } from '@/features/economy/wallet';
import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { events } from '@/shared/db/schema';
import { desc, eq } from 'drizzle-orm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function ClaimPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const availableEvents = await db.query.events.findMany({
    where: eq(events.status, 'ACTIVE'),
    orderBy: [desc(events.date)],
  });

  const userWallets = await getEventWallets(session.user.id);
  const joinedEventIds = new Set(userWallets.map((w) => w.eventId));

  const eventsWithJoinStatus = availableEvents.map((event) => ({
    ...event,
    isJoined: joinedEventIds.has(event.id),
  }));

  return (
    <div className="flex flex-col items-center p-4 lg:p-8">
      <div className="w-full max-w-5xl space-y-8">
        <div className="flex items-center gap-4">
          <Link
            href="/mypage"
            className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            <ChevronLeft size={16} />
            マイページへ戻る
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-semibold text-gray-900">お小遣いを貰う</h1>
          <p className="font-semibold text-gray-500">開催中のイベントに参加して、軍資金を受け取りましょう。</p>
        </div>

        <section>
          <EventClaimList events={eventsWithJoinStatus} />
        </section>
      </div>
    </div>
  );
}
