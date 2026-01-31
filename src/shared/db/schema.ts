import type { AdapterAccount } from '@auth/core/adapters';
import {
  bigint,
  date,
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

// --- Enums ---
export const roleEnum = pgEnum('role', ['USER', 'ADMIN']);

// --- Auth.js Tables ---

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  image: text('image'),
  role: roleEnum('role').default('USER').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
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

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

// --- Economy System ---

export const eventStatusEnum = pgEnum('event_status', ['SCHEDULED', 'ACTIVE', 'COMPLETED']);

export const events = pgTable('event', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  distributeAmount: bigint('distributeAmount', { mode: 'number' }).notNull(),
  status: eventStatusEnum('status').default('SCHEDULED').notNull(),
  startDate: timestamp('startDate').notNull(),
  endDate: timestamp('endDate').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const wallets = pgTable('wallet', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  eventId: uuid('eventId')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  balance: bigint('balance', { mode: 'number' }).default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const transactionTypeEnum = pgEnum('transaction_type', [
  'DISTRIBUTION',
  'BET',
  'PAYOUT',
  'REFUND',
  'ADJUSTMENT',
]);

export const transactions = pgTable('transaction', {
  id: uuid('id').defaultRandom().primaryKey(),
  walletId: uuid('walletId')
    .notNull()
    .references(() => wallets.id, { onDelete: 'cascade' }),
  type: transactionTypeEnum('type').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  referenceId: uuid('referenceId'), // Event ID or Bet ID
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

// --- Racing Data System ---

export const horses = pgTable('horse', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  gender: text('gender').notNull(),
  sireId: uuid('sireId'),
  damId: uuid('damId'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const dailySchedules = pgTable('daily_schedule', {
  id: uuid('id').defaultRandom().primaryKey(),
  date: date('date').notNull(),
  location: text('location').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const raceStatusEnum = pgEnum('race_status', ['SCHEDULED', 'CLOSED', 'FINALIZED', 'CANCELLED']);

export const races = pgTable('race', {
  id: uuid('id').defaultRandom().primaryKey(),
  scheduleId: uuid('scheduleId')
    .notNull()
    .references(() => dailySchedules.id, { onDelete: 'cascade' }),
  raceNumber: integer('raceNumber').notNull(),
  name: text('name').notNull(),
  startTime: timestamp('startTime').notNull(),
  distance: integer('distance').notNull(),
  surface: text('surface').notNull(),
  condition: text('condition'),
  status: raceStatusEnum('status').default('SCHEDULED').notNull(),
  finalizedAt: timestamp('finalizedAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const betStatusEnum = pgEnum('bet_status', ['PENDING', 'HIT', 'LOST', 'REFUNDED']);

export const bets = pgTable('bet', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  raceId: uuid('raceId')
    .notNull()
    .references(() => races.id, { onDelete: 'cascade' }),
  walletId: uuid('walletId')
    .notNull()
    .references(() => wallets.id, { onDelete: 'cascade' }),
  details: jsonb('details').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  odds: numeric('odds'),
  payout: bigint('payout', { mode: 'number' }),
  status: betStatusEnum('status').default('PENDING').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const raceEntryStatusEnum = pgEnum('race_entry_status', ['ENTRANT', 'SCRATCHED', 'EXCLUDED']);

export const raceEntries = pgTable('race_entry', {
  id: uuid('id').defaultRandom().primaryKey(),
  raceId: uuid('raceId')
    .notNull()
    .references(() => races.id, { onDelete: 'cascade' }),
  horseId: uuid('horseId')
    .notNull()
    .references(() => horses.id, { onDelete: 'cascade' }),
  bracketNumber: integer('bracketNumber'),
  horseNumber: integer('horseNumber'),
  jockey: text('jockey'),
  weight: integer('weight'),
  status: raceEntryStatusEnum('status').default('ENTRANT').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
