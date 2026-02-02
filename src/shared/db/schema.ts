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

export const roleEnum = pgEnum('role', ['USER', 'ADMIN', 'GUEST', 'TIPSTER', 'AI_TIPSTER', 'AI_USER']);

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('email_verified', { mode: 'date', withTimezone: true }),
  image: text('image'),
  role: roleEnum('role').default('USER').notNull(),
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

export const eventStatusEnum = pgEnum('event_status', ['SCHEDULED', 'ACTIVE', 'COMPLETED']);

export const events = pgTable('event', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  distributeAmount: bigint('distribute_amount', { mode: 'number' }).notNull(),
  status: eventStatusEnum('status').default('SCHEDULED').notNull(),
  date: date('date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const wallets = pgTable('wallet', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  balance: bigint('balance', { mode: 'number' }).default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

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
  })
);

export const horseOriginEnum = pgEnum('horse_origin', ['DOMESTIC', 'FOREIGN_BRED', 'FOREIGN_TRAINED']);

export const horses = pgTable('horse', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  gender: text('gender').notNull(),
  age: integer('age'),
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

export const races = pgTable('race', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  location: text('location').notNull(),
  name: text('name').notNull(),
  raceNumber: integer('race_number'),
  distance: integer('distance').notNull(),
  surface: text('surface').notNull(),
  condition: text('condition'),
  status: raceStatusEnum('status').default('SCHEDULED').notNull(),
  closingAt: timestamp('closing_at', { withTimezone: true }),
  finalizedAt: timestamp('finalized_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const betStatusEnum = pgEnum('bet_status', ['PENDING', 'HIT', 'LOST', 'REFUNDED']);

export const bets = pgTable('bet', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  raceId: uuid('race_id')
    .notNull()
    .references(() => races.id, { onDelete: 'cascade' }),
  walletId: uuid('wallet_id')
    .notNull()
    .references(() => wallets.id, { onDelete: 'cascade' }),
  details: jsonb('details').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  odds: numeric('odds'),
  payout: bigint('payout', { mode: 'number' }),
  status: betStatusEnum('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const raceEntryStatusEnum = pgEnum('race_entry_status', ['ENTRANT', 'SCRATCHED', 'EXCLUDED']);

export const raceEntries = pgTable('race_entry', {
  id: uuid('id').defaultRandom().primaryKey(),
  raceId: uuid('race_id')
    .notNull()
    .references(() => races.id, { onDelete: 'cascade' }),
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
});

export const payoutResults = pgTable('payout_result', {
  id: uuid('id').defaultRandom().primaryKey(),
  raceId: uuid('race_id')
    .notNull()
    .references(() => races.id, { onDelete: 'cascade' }),
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
  races: many(races),
}));

export const raceRelations = relations(races, ({ one, many }) => ({
  event: one(events, {
    fields: [races.eventId],
    references: [events.id],
  }),
  entries: many(raceEntries),
  bets: many(bets),
}));

export const raceEntryRelations = relations(raceEntries, ({ one }) => ({
  race: one(races, {
    fields: [raceEntries.raceId],
    references: [races.id],
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
  race: one(races, {
    fields: [bets.raceId],
    references: [races.id],
  }),
  wallet: one(wallets, {
    fields: [bets.walletId],
    references: [wallets.id],
  }),
}));

export const userRelations = relations(users, ({ many }) => ({
  wallets: many(wallets),
  bets: many(bets),
  accounts: many(accounts),
}));
