import { UserProfile } from '@/entities/user';
import { LogoutButton } from '@/features/auth';
import { EventClaimList } from '@/features/economy/claim';
import { WalletOverview, getEventWallets } from '@/features/economy/wallet';
import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { events } from '@/shared/db/schema';
import { Button, Card, CardContent } from '@/shared/ui';
import { desc, eq, not } from 'drizzle-orm';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function MyPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const availableEvents = await db.query.events.findMany({
    where: not(eq(events.status, 'COMPLETED')),
    orderBy: [desc(events.date)],
  });

  const userWallets = await getEventWallets(session.user.id);
  const joinedEventIds = new Set(userWallets.map((w) => w.eventId));
  const joinableEvents = availableEvents.filter((e) => !joinedEventIds.has(e.id));

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <UserProfile user={session.user} />
            <div className="flex items-center gap-4">
              {session.user.role === 'ADMIN' && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    Admin Panel
                  </Button>
                </Link>
              )}
              <LogoutButton />
            </div>
          </CardContent>
        </Card>

        <section>
          <h2 className="text-secondary mb-4 text-xl font-bold">開催中のイベント (未参加)</h2>
          <EventClaimList events={joinableEvents} />
        </section>

        <section>
          <h2 className="text-secondary mb-4 text-xl font-bold">参加済みイベント / ウォレット</h2>
          <WalletOverview wallets={userWallets} />
        </section>
      </div>
    </div>
  );
}
