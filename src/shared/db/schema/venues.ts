import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { VENUE_DIRECTIONS } from '../../constants/race';

export const venueAreaEnum = pgEnum('venue_area', ['EAST_JAPAN', 'WEST_JAPAN', 'OVERSEAS']);
export const venueDirectionEnum = pgEnum('venue_direction', VENUE_DIRECTIONS);

export const venues = pgTable('venue', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  shortName: text('short_name').notNull(),
  code: text('code'),
  defaultDirection: venueDirectionEnum('default_direction').notNull(),
  area: venueAreaEnum('area').default('EAST_JAPAN').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
