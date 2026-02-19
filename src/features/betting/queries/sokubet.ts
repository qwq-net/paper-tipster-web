import { db } from '@/shared/db';
import { bet5Events, raceInstances, wallets } from '@/shared/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';

export async function getSokubetDashboardData(userId: string) {
  const [activeEvents, userWallets, bet5EventsList] = await Promise.all([
    db.query.events.findMany({
      where: (events, { eq }) => eq(events.status, 'ACTIVE'),
      columns: { id: true },
    }),
    db.query.wallets.findMany({
      where: eq(wallets.userId, userId),
    }),
    db.query.bet5Events.findMany({
      where: eq(bet5Events.status, 'SCHEDULED'),
    }),
  ]);

  if (activeEvents.length === 0) {
    return [];
  }

  const activeEventIds = activeEvents.map((event) => event.id);
  const activeRaces = await db.query.raceInstances.findMany({
    where: inArray(raceInstances.eventId, activeEventIds),
    orderBy: [desc(raceInstances.date)],
    with: {
      event: true,
      venue: true,
      entries: true,
    },
  });

  const walletByEventId = new Map(userWallets.map((wallet) => [wallet.eventId, wallet]));
  const bet5ByEventId = new Map(bet5EventsList.map((bet5Event) => [bet5Event.eventId, bet5Event]));

  const eventGroups = activeRaces.reduce(
    (acc, race) => {
      const eventId = race.event.id;
      if (!acc[eventId]) {
        const wallet = walletByEventId.get(eventId);
        const bet5 = bet5ByEventId.get(eventId);
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
