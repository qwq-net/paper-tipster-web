import { db } from '@/shared/db';

export async function getAdminRaceGroups() {
  const eventsData = await db.query.events.findMany({
    orderBy: (events, { desc }) => [desc(events.date)],
    with: {
      races: {
        with: {
          venue: true,
          entries: true,
        },
        orderBy: (raceInstances, { asc }) => [asc(raceInstances.raceNumber), raceInstances.name],
      },
    },
  });

  return eventsData.map((event) => ({
    id: event.id,
    name: event.name,
    date: event.date,
    status: event.status,
    races: event.races,
  }));
}
