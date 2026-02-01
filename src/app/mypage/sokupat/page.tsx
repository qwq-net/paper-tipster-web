import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { races } from '@/shared/db/schema';
import { Card } from '@/shared/ui';
import { desc, eq } from 'drizzle-orm';
import { ChevronLeft, Zap } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function SokupatPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const scheduledRaces = await db.query.races.findMany({
    where: eq(races.status, 'SCHEDULED'),
    orderBy: [desc(races.date)],
    with: {
      event: true,
    },
  });

  const eventGroups = scheduledRaces.reduce(
    (acc, race) => {
      const eventId = race.event.id;
      if (!acc[eventId]) {
        acc[eventId] = {
          event: race.event,
          races: [],
        };
      }
      acc[eventId].races.push(race);
      return acc;
    },
    {} as Record<string, { event: (typeof scheduledRaces)[0]['event']; races: typeof scheduledRaces }>
  );

  const sortedEventGroups = Object.values(eventGroups).sort(
    (a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime()
  );

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-4xl space-y-8">
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
            <h1 className="text-3xl font-black text-gray-900">即PAT</h1>
            <p className="text-gray-500">開催中のレースを選択して、馬券を購入しましょう。</p>
          </div>
        </div>

        {sortedEventGroups.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">現在、開催予定のレースはありません。</Card>
        ) : (
          <div className="space-y-8">
            {sortedEventGroups.map(({ event, races }) => (
              <section key={event.id}>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
                  <p className="text-sm text-gray-500">{event.date}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {races.map((race) => (
                    <Link key={race.id} href={`/races/${race.id}`}>
                      <Card className="hover:border-primary p-6 transition-all hover:shadow-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-gray-700 uppercase">
                                {race.location}
                              </span>
                              <span className="text-xs font-medium text-gray-400">{race.date}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{race.name}</h3>
                            <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                              <span>{race.distance}m</span>
                              <span className="h-1 w-1 rounded-full bg-gray-300" />
                              <span>{race.surface}</span>
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
