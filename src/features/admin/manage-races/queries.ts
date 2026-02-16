import { db } from '@/shared/db';

export async function getAdminRaceGroups() {
  const races = await db.query.raceInstances.findMany({
    orderBy: (raceInstances, { asc, desc: d }) => [
      asc(raceInstances.raceNumber),
      d(raceInstances.date),
      raceInstances.name,
    ],
    with: {
      event: true,
      venue: true,
      entries: true,
    },
  });

  const eventGroups = races.reduce<
    Record<
      string,
      {
        id: string;
        name: string;
        date: string;
        status: string;
        races: typeof races;
      }
    >
  >((acc, race) => {
    const eventId = race.event.id;
    if (!acc[eventId]) {
      acc[eventId] = {
        id: race.event.id,
        name: race.event.name,
        date: race.event.date,
        status: race.event.status,
        races: [],
      };
    }
    acc[eventId].races.push(race);
    return acc;
  }, {});

  return Object.values(eventGroups).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
