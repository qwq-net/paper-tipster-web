import { UserProfile } from '@/entities/user';
import { LogoutButton } from '@/features/auth';
import { EventClaimList } from '@/features/economy/claim';
import { WalletOverview, getEventWallets } from '@/features/economy/wallet';
import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { events, races } from '@/shared/db/schema';
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

  const scheduledRaces = await db.query.races.findMany({
    where: eq(races.status, 'SCHEDULED'),
    orderBy: [desc(races.date)],
    limit: 5,
  });

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
          <h2 className="text-secondary mb-4 text-xl font-bold">開催中のレース (馬券購入)</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {scheduledRaces.map((race) => (
              <Link key={race.id} href={`/races/${race.id}`}>
                <Card className="hover:border-primary p-4 transition-all hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-secondary text-xs font-bold">{race.location}</span>
                        <span className="text-xs text-gray-400">{race.date}</span>
                      </div>
                      <h3 className="font-bold text-gray-900">{race.name}</h3>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary font-bold">
                      購入する
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
            {scheduledRaces.length === 0 && (
              <Card className="p-8 text-center text-gray-500 md:col-span-2">現在、開催予定のレースはありません。</Card>
            )}
          </div>
        </section>

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
