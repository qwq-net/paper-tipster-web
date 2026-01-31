import { UserProfile } from '@/entities/user';
import { LogoutButton } from '@/features/auth';
import { EventClaimList } from '@/features/economy/claim';
import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { events, wallets } from '@/shared/db/schema';
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
  const userWallets = await db.query.wallets.findMany({
    where: eq(wallets.userId, session.user.id),
  });
  const joinedEventIds = new Set(userWallets.map((w) => w.eventId));
  const claimableEvents = availableEvents.filter((e) => !joinedEventIds.has(e.id));

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
          <EventClaimList events={claimableEvents} />
        </section>

        <section>
          <h2 className="text-secondary mb-4 text-xl font-bold">参加済みイベント / ウォレット</h2>
          {userWallets.length === 0 ? (
            <p className="text-gray-500">まだ参加しているイベントはありません。</p>
          ) : (
            <Card>
              <CardContent>
                <p className="text-gray-600">{userWallets.length} 件のイベントに参加中 (詳細は今後実装)</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
