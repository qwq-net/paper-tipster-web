import type { AdapterAccount } from '@auth/core/adapters';
import { relations } from 'drizzle-orm';
import {
  bigint,
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { HORSE_TAG_TYPES, HORSE_TYPES } from '../constants/horse';
import { RACE_GRADES, RACE_TYPES, VENUE_DIRECTIONS } from '../constants/race';

export const roleEnum = pgEnum('role', ['USER', 'ADMIN', 'GUEST', 'TIPSTER', 'AI_TIPSTER', 'AI_USER']);
export const horseTypeEnum = pgEnum('horse_type', HORSE_TYPES);
export const raceTypeEnum = pgEnum('race_type', RACE_TYPES);
export const raceGradeEnum = pgEnum('race_grade', RACE_GRADES);
export const venueDirectionEnum = pgEnum('venue_direction', VENUE_DIRECTIONS);
export const horseTagTypeEnum = pgEnum('horse_tag_type', HORSE_TAG_TYPES);

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('email_verified', { mode: 'date', withTimezone: true }),
  image: text('image'),
  role: roleEnum('role').default('USER').notNull(),
  guestCodeId: text('guest_code_id'),
  password: text('password'),
  isOnboardingCompleted: boolean('is_onboarding_completed').default(false).notNull(),
  disabledAt: timestamp('disabled_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const accounts = pgTable(
  'account',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessions = pgTable('session', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date', withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date', withTimezone: true }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

export const guestCodes = pgTable('guest_code', {
  code: text('code').primaryKey(),
  title: text('title').notNull(),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  disabledAt: timestamp('disabled_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const venueAreaEnum = pgEnum('venue_area', ['EAST_JAPAN', 'WEST_JAPAN', 'OVERSEAS']);

export const venues = pgTable('venue', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  shortName: text('short_name').notNull(),
  code: text('code'),
  defaultDirection: venueDirectionEnum('default_direction').notNull(),
  area: venueAreaEnum('area').default('EAST_JAPAN').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const eventStatusEnum = pgEnum('event_status', ['SCHEDULED', 'ACTIVE', 'COMPLETED']);

export const events = pgTable('event', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  distributeAmount: bigint('distribute_amount', { mode: 'number' }).notNull(),
  status: eventStatusEnum('status').default('SCHEDULED').notNull(),
  rankingPublished: boolean('ranking_published').default(false).notNull(),
  date: date('date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const wallets = pgTable(
  'wallet',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    balance: bigint('balance', { mode: 'number' }).default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userEventIdx: index('wallet_user_event_idx').on(table.userId, table.eventId),
  })
);

export const transactionTypeEnum = pgEnum('transaction_type', [
  'DISTRIBUTION',
  'BET',
  'PAYOUT',
  'REFUND',
  'ADJUSTMENT',
]);

export const transactions = pgTable(
  'transaction',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    walletId: uuid('wallet_id')
      .notNull()
      .references(() => wallets.id, { onDelete: 'cascade' }),
    type: transactionTypeEnum('type').notNull(),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    referenceId: uuid('reference_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    referenceIdx: index('transaction_reference_idx').on(table.referenceId),
    walletIdx: index('transaction_wallet_idx').on(table.walletId),
  })
);

export const horseOriginEnum = pgEnum('horse_origin', ['DOMESTIC', 'FOREIGN_BRED', 'FOREIGN_TRAINED']);

export const horseTags = pgTable('horse_tag', {
  id: uuid('id').defaultRandom().primaryKey(),
  horseId: uuid('horse_id')
    .notNull()
    .references(() => horses.id, { onDelete: 'cascade' }),
  type: horseTagTypeEnum('type').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const horseTagMaster = pgTable('horse_tag_master', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: horseTagTypeEnum('type').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const horseGenderEnum = pgEnum('horse_gender', ['MARE', 'FILLY', 'HORSE', 'COLT', 'GELDING']);

export const horses = pgTable('horse', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  gender: horseGenderEnum('gender').notNull(),
  age: integer('age'),
  type: horseTypeEnum('type').default('REAL').notNull(),
  origin: horseOriginEnum('origin').default('DOMESTIC').notNull(),
  notes: text('notes'),
  sireId: uuid('sire_id'),
  damId: uuid('dam_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const raceStatusEnum = pgEnum('race_status', ['SCHEDULED', 'CLOSED', 'FINALIZED', 'CANCELLED']);

export const raceDefinitions = pgTable('race_definition', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  code: text('code'),
  grade: raceGradeEnum('grade').notNull(),
  type: raceTypeEnum('type').default('REAL').notNull(),
  defaultDirection: venueDirectionEnum('default_direction').notNull(),
  defaultDistance: integer('default_distance').notNull(),
  defaultVenueId: uuid('default_venue_id')
    .notNull()
    .references(() => venues.id),
  defaultSurface: text('default_surface').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const raceInstances = pgTable(
  'race_instance',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    raceDefinitionId: uuid('race_definition_id').references(() => raceDefinitions.id),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    venueId: uuid('venue_id')
      .references(() => venues.id)
      .notNull(),
    location: text('location'),
    name: text('name').notNull(),
    raceNumber: integer('race_number'),
    distance: integer('distance').notNull(),
    surface: text('surface').notNull(),
    condition: text('condition'),
    grade: raceGradeEnum('grade'),
    direction: venueDirectionEnum('direction'),
    type: raceTypeEnum('type').default('REAL').notNull(),
    status: raceStatusEnum('status').default('SCHEDULED').notNull(),
    closingAt: timestamp('closing_at', { withTimezone: true }),
    finalizedAt: timestamp('finalized_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    eventIdx: index('race_instance_event_idx').on(table.eventId),
    statusIdx: index('race_instance_status_idx').on(table.status),
  })
);

export const betStatusEnum = pgEnum('bet_status', ['PENDING', 'HIT', 'LOST', 'REFUNDED']);

export const betGroups = pgTable('bet_group', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  raceId: uuid('race_id')
    .notNull()
    .references(() => raceInstances.id, { onDelete: 'cascade' }),
  walletId: uuid('wallet_id')
    .notNull()
    .references(() => wallets.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  totalAmount: bigint('total_amount', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const bets = pgTable(
  'bet',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    raceId: uuid('race_id')
      .notNull()
      .references(() => raceInstances.id, { onDelete: 'cascade' }),
    walletId: uuid('wallet_id')
      .notNull()
      .references(() => wallets.id, { onDelete: 'cascade' }),
    betGroupId: uuid('bet_group_id')
      .notNull()
      .references(() => betGroups.id, { onDelete: 'cascade' }),
    details: jsonb('details').notNull(),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    odds: numeric('odds'),
    payout: bigint('payout', { mode: 'number' }),
    status: betStatusEnum('status').default('PENDING').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    raceIdx: index('bet_race_idx').on(table.raceId),
    userIdx: index('bet_user_idx').on(table.userId),
    groupIdx: index('bet_group_idx').on(table.betGroupId),
  })
);

export const raceEntryStatusEnum = pgEnum('race_entry_status', ['ENTRANT', 'SCRATCHED', 'EXCLUDED']);

export const raceEntries = pgTable(
  'race_entry',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    raceId: uuid('race_id')
      .notNull()
      .references(() => raceInstances.id, { onDelete: 'cascade' }),
    horseId: uuid('horse_id')
      .notNull()
      .references(() => horses.id, { onDelete: 'cascade' }),
    bracketNumber: integer('bracket_number'),
    horseNumber: integer('horse_number'),
    jockey: text('jockey'),
    weight: integer('weight'),
    finishPosition: integer('finish_position'),
    status: raceEntryStatusEnum('status').default('ENTRANT').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    raceIdx: index('race_entry_race_idx').on(table.raceId),
    racePosIdx: index('race_entry_race_pos_idx').on(table.raceId, table.finishPosition),
  })
);

export const payoutResults = pgTable('payout_result', {
  id: uuid('id').defaultRandom().primaryKey(),
  raceId: uuid('race_id')
    .notNull()
    .references(() => raceInstances.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  combinations: jsonb('combinations').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const walletRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [wallets.eventId],
    references: [events.id],
  }),
  transactions: many(transactions),
}));

export const eventRelations = relations(events, ({ many }) => ({
  wallets: many(wallets),
  races: many(raceInstances),
}));

export const horseWins = pgTable('horse_win', {
  id: uuid('id').defaultRandom().primaryKey(),
  horseId: uuid('horse_id')
    .notNull()
    .references(() => horses.id, { onDelete: 'cascade' }),
  raceInstanceId: uuid('race_instance_id').references(() => raceInstances.id, { onDelete: 'set null' }),
  raceDefinitionId: uuid('race_definition_id').references(() => raceDefinitions.id, {
    onDelete: 'set null',
  }),
  title: text('title').notNull(),
  date: date('date'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const raceEntryRelations = relations(raceEntries, ({ one }) => ({
  race: one(raceInstances, {
    fields: [raceEntries.raceId],
    references: [raceInstances.id],
  }),
  horse: one(horses, {
    fields: [raceEntries.horseId],
    references: [horses.id],
  }),
}));

export const transactionRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
  bet: one(bets, {
    fields: [transactions.referenceId],
    references: [bets.id],
  }),
  event: one(events, {
    fields: [transactions.referenceId],
    references: [events.id],
  }),
}));

export const betRelations = relations(bets, ({ one }) => ({
  user: one(users, {
    fields: [bets.userId],
    references: [users.id],
  }),
  race: one(raceInstances, {
    fields: [bets.raceId],
    references: [raceInstances.id],
  }),
  wallet: one(wallets, {
    fields: [bets.walletId],
    references: [wallets.id],
  }),
  group: one(betGroups, {
    fields: [bets.betGroupId],
    references: [betGroups.id],
  }),
}));

export const betGroupRelations = relations(betGroups, ({ one, many }) => ({
  user: one(users, {
    fields: [betGroups.userId],
    references: [users.id],
  }),
  race: one(raceInstances, {
    fields: [betGroups.raceId],
    references: [raceInstances.id],
  }),
  wallet: one(wallets, {
    fields: [betGroups.walletId],
    references: [wallets.id],
  }),
  bets: many(bets),
}));

export const userRelations = relations(users, ({ many }) => ({
  wallets: many(wallets),
  bets: many(bets),
  betGroups: many(betGroups),
  accounts: many(accounts),
  createdGuestCodes: many(guestCodes, { relationName: 'creator' }),
  createdRaces: many(raceInstances),
}));

export const guestCodeRelations = relations(guestCodes, ({ one }) => ({
  creator: one(users, {
    fields: [guestCodes.createdBy],
    references: [users.id],
    relationName: 'creator',
  }),
}));

export const horseRelations = relations(horses, ({ many }) => ({
  tags: many(horseTags),
  entries: many(raceEntries),
  wins: many(horseWins),
}));

export const horseTagRelations = relations(horseTags, ({ one }) => ({
  horse: one(horses, {
    fields: [horseTags.horseId],
    references: [horses.id],
  }),
}));

export const venuesRelations = relations(venues, ({ many }) => ({
  raceDefinitions: many(raceDefinitions),
  races: many(raceInstances),
}));

export const raceDefinitionsRelations = relations(raceDefinitions, ({ one }) => ({
  defaultVenue: one(venues, {
    fields: [raceDefinitions.defaultVenueId],
    references: [venues.id],
  }),
}));

export const raceInstancesRelations = relations(raceInstances, ({ one, many }) => ({
  event: one(events, {
    fields: [raceInstances.eventId],
    references: [events.id],
  }),
  venue: one(venues, {
    fields: [raceInstances.venueId],
    references: [venues.id],
  }),
  definition: one(raceDefinitions, {
    fields: [raceInstances.raceDefinitionId],
    references: [raceDefinitions.id],
  }),
  entries: many(raceEntries),
  odds: one(raceOdds),
}));

export const raceOdds = pgTable('race_odds', {
  id: uuid('id').defaultRandom().primaryKey(),
  raceId: uuid('race_id')
    .notNull()
    .unique()
    .references(() => raceInstances.id, { onDelete: 'cascade' }),
  winOdds: jsonb('win_odds').$type<Record<string, number>>(),
  placeOdds: jsonb('place_odds').$type<Record<string, { min: number; max: number }>>(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const raceOddsRelations = relations(raceOdds, ({ one }) => ({
  race: one(raceInstances, {
    fields: [raceOdds.raceId],
    references: [raceInstances.id],
  }),
}));

export const bet5Events = pgTable('bet5_event', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  race1Id: uuid('race1_id')
    .notNull()
    .references(() => raceInstances.id),
  race2Id: uuid('race2_id')
    .notNull()
    .references(() => raceInstances.id),
  race3Id: uuid('race3_id')
    .notNull()
    .references(() => raceInstances.id),
  race4Id: uuid('race4_id')
    .notNull()
    .references(() => raceInstances.id),
  race5Id: uuid('race5_id')
    .notNull()
    .references(() => raceInstances.id),
  initialPot: bigint('initial_pot', { mode: 'number' }).default(0).notNull(),
  status: raceStatusEnum('status').default('SCHEDULED').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const bet5Tickets = pgTable(
  'bet5_ticket',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    bet5EventId: uuid('bet5_event_id')
      .notNull()
      .references(() => bet5Events.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    walletId: uuid('wallet_id')
      .notNull()
      .references(() => wallets.id, { onDelete: 'cascade' }),
    race1HorseIds: jsonb('race1_horse_ids').$type<string[]>().notNull(),
    race2HorseIds: jsonb('race2_horse_ids').$type<string[]>().notNull(),
    race3HorseIds: jsonb('race3_horse_ids').$type<string[]>().notNull(),
    race4HorseIds: jsonb('race4_horse_ids').$type<string[]>().notNull(),
    race5HorseIds: jsonb('race5_horse_ids').$type<string[]>().notNull(),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    isWin: boolean('is_win'),
    payout: bigint('payout', { mode: 'number' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    eventIdx: index('bet5_ticket_event_idx').on(table.bet5EventId),
  })
);

export const bet5EventRelations = relations(bet5Events, ({ one, many }) => ({
  event: one(events, {
    fields: [bet5Events.eventId],
    references: [events.id],
  }),
  race1: one(raceInstances, {
    fields: [bet5Events.race1Id],
    references: [raceInstances.id],
    relationName: 'bet5_race1',
  }),
  race2: one(raceInstances, {
    fields: [bet5Events.race2Id],
    references: [raceInstances.id],
    relationName: 'bet5_race2',
  }),
  race3: one(raceInstances, {
    fields: [bet5Events.race3Id],
    references: [raceInstances.id],
    relationName: 'bet5_race3',
  }),
  race4: one(raceInstances, {
    fields: [bet5Events.race4Id],
    references: [raceInstances.id],
    relationName: 'bet5_race4',
  }),
  race5: one(raceInstances, {
    fields: [bet5Events.race5Id],
    references: [raceInstances.id],
    relationName: 'bet5_race5',
  }),
  tickets: many(bet5Tickets),
}));

export const bet5TicketRelations = relations(bet5Tickets, ({ one }) => ({
  bet5Event: one(bet5Events, {
    fields: [bet5Tickets.bet5EventId],
    references: [bet5Events.id],
  }),
  user: one(users, {
    fields: [bet5Tickets.userId],
    references: [users.id],
  }),
  wallet: one(wallets, {
    fields: [bet5Tickets.walletId],
    references: [wallets.id],
  }),
}));
