import { db } from '@/shared/db';
import { bet5Events, raceInstances, wallets } from '@/shared/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function getSokubetDashboardData(userId: string) {
  const [allRaces, userWallets, bet5EventsList] = await Promise.all([
    db.query.raceInstances.findMany({
      orderBy: [desc(raceInstances.date)],
      with: {
        event: true,
        venue: true,
        entries: true,
      },
    }),
    db.query.wallets.findMany({
      where: eq(wallets.userId, userId),
    }),
    db.query.bet5Events.findMany({
      where: eq(bet5Events.status, 'SCHEDULED'),
    }),
  ]);

  const activeRaces = allRaces.filter((race) => race.event.status === 'ACTIVE');

  const eventGroups = activeRaces.reduce(
    (acc, race) => {
      const eventId = race.event.id;
      if (!acc[eventId]) {
        const wallet = userWallets.find((w) => w.eventId === eventId);
        const bet5 = bet5EventsList.find((b) => b.eventId === eventId);
        acc[eventId] = {
          event: race.event,
          races: [],
          balance: wallet?.balance ?? 0,
          totalLoaned: wallet?.totalLoaned ?? 0,
          bet5Id: bet5?.id,
          hasWallet: !!wallet,
        };
      }
      acc[eventId].races.push(race);
      return acc;
    },
    {} as Record<
      string,
      {
        event: (typeof activeRaces)[0]['event'];
        races: typeof activeRaces;
        balance: number;
        totalLoaned: number;
        bet5Id?: string;
        hasWallet: boolean;
      }
    >
  );

  return Object.values(eventGroups)
    .sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime())
    .map((group) => ({
      ...group,
      races: group.races.sort((a, b) => (a.raceNumber || 999) - (b.raceNumber || 999)),
    }));
}
