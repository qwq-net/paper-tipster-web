import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { races, wallets } from '@/shared/db/schema';
import { Badge, Card } from '@/shared/ui';
import { desc, eq } from 'drizzle-orm';
import { ChevronLeft, Wallet, Zap } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: '受付中',
  CLOSED: '締切済み',
  FINALIZED: '結果確定済み',
  CANCELLED: 'キャンセル',
};

export default async function SokupatPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const [allRaces, userWallets] = await Promise.all([
    db.query.races.findMany({
      orderBy: [desc(races.date)],
      with: {
        event: true,
        entries: true,
      },
    }),
    db.query.wallets.findMany({
      where: eq(wallets.userId, session.user.id),
    }),
  ]);

  const activeRaces = allRaces.filter((race) => race.event.status === 'ACTIVE');

  const eventGroups = activeRaces.reduce(
    (acc, race) => {
      const eventId = race.event.id;
      if (!acc[eventId]) {
        const wallet = userWallets.find((w) => w.eventId === eventId);
        acc[eventId] = {
          event: race.event,
          races: [],
          balance: wallet?.balance ?? 0,
        };
      }
      acc[eventId].races.push(race);
      return acc;
    },
    {} as Record<string, { event: (typeof activeRaces)[0]['event']; races: typeof activeRaces; balance: number }>
  );

  const sortedEventGroups = Object.values(eventGroups)
    .sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime())
    .map((group) => ({
      ...group,
      races: group.races.sort((a, b) => (a.raceNumber || 999) - (b.raceNumber || 999)),
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

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
            <Zap size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">即PAT</h1>
            <p className="text-gray-500">開催中のレースを選択して、馬券を購入しましょう。</p>
          </div>
        </div>

        {sortedEventGroups.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">現在、開催中のイベントはありません。</Card>
        ) : (
          <div className="space-y-8">
            {sortedEventGroups.map(({ event, races, balance }) => (
              <section key={event.id}>
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">{event.name}</h2>
                    <p className="mt-1 text-sm font-semibold text-gray-400">{event.date}</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 ring-1 ring-gray-200 ring-inset sm:py-2">
                    <Wallet size={16} className="text-gray-400" />
                    <span className="text-sm font-semibold text-nowrap text-gray-500">投票可能残高</span>
                    <span className="flex-1 text-right text-lg font-semibold text-gray-900 sm:flex-none">
                      {Math.floor(balance).toLocaleString()}
                      <span className="ml-0.5 text-sm font-semibold text-gray-400">円</span>
                    </span>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {races.map((race) => (
                    <Link key={race.id} href={`/races/${race.id}`}>
                      <Card className="hover:border-primary p-6 transition-all hover:shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-500">{race.location}</span>
                              {race.raceNumber && (
                                <span className="flex h-5 w-7 items-center justify-center rounded bg-gray-100 text-sm font-semibold text-gray-600">
                                  {race.raceNumber}R
                                </span>
                              )}
                              <Badge variant="status" label={STATUS_LABELS[race.status] || race.status} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">{race.name}</h3>
                            <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                              <span>{race.surface}</span>
                              <span className="h-1 w-1 rounded-full bg-gray-300" />
                              <span>{race.distance}m</span>
                              <span className="h-1 w-1 rounded-full bg-gray-300" />
                              <span>{race.entries?.length || 0}頭</span>
                            </div>
                          </div>
                          <div className="bg-primary/10 text-primary hover:bg-primary flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:text-white">
                            <ChevronLeft size={20} className="rotate-180" />
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
