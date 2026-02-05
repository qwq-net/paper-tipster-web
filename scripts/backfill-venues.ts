import { db } from '@/shared/db';
import { raceInstances, venues } from '@/shared/db/schema';
import { eq, isNull } from 'drizzle-orm';

const VENUE_MAPPING: Record<string, { shortName: string; direction: 'LEFT' | 'RIGHT' | 'STRAIGHT' }> = {
  東京: { shortName: '東京', direction: 'LEFT' },
  中山: { shortName: '中山', direction: 'RIGHT' },
  京都: { shortName: '京都', direction: 'RIGHT' },
  阪神: { shortName: '阪神', direction: 'RIGHT' },
  中京: { shortName: '中京', direction: 'LEFT' },
  札幌: { shortName: '札幌', direction: 'RIGHT' },
  函館: { shortName: '函館', direction: 'RIGHT' },
  福島: { shortName: '福島', direction: 'RIGHT' },
  新潟: { shortName: '新潟', direction: 'LEFT' },
  小倉: { shortName: '小倉', direction: 'RIGHT' },
};

async function main() {
  console.log('Starting venue backfill...');

  const racesWithoutVenue = await db.select().from(raceInstances).where(isNull(raceInstances.venueId));

  console.log(`Found ${racesWithoutVenue.length} races without venueId.`);

  for (const race of racesWithoutVenue) {
    if (!race.location) {
      console.warn(`Race ${race.id} has no location string. Skipping.`);
      continue;
    }

    const locationName = race.location;

    let venue = await db.query.venues.findFirst({
      where: (venues, { eq }) => eq(venues.name, locationName),
    });

    if (!venue) {
      console.log(`Creating venue for ${locationName}...`);
      const mapping = VENUE_MAPPING[locationName] || { shortName: locationName.substring(0, 2), direction: 'RIGHT' };

      const [newVenue] = await db
        .insert(venues)
        .values({
          name: locationName,
          shortName: mapping.shortName,
          defaultDirection: mapping.direction,
        })
        .returning();

      venue = newVenue;
    }

    await db.update(raceInstances).set({ venueId: venue.id }).where(eq(raceInstances.id, race.id));

    console.log(`Updated race ${race.id} (${race.name}) with venue ${venue.name}`);
  }

  console.log('Backfill complete.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error in backfill:', err);
  process.exit(1);
});
