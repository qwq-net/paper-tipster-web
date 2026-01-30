import {
  bigint,
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import type { AdapterAccount } from '@auth/core/adapters';

// --- Enums ---
export const roleEnum = pgEnum('role', ['USER', 'ADMIN']);

// --- Auth.js Tables ---

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  role: roleEnum('role').default('USER').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdate(() => new Date()),
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

export const bankAccounts = pgTable('bank_account', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  balance: bigint('balance', { mode: 'number' }).default(0).notNull(), // Using number mode for easier handling, watch out for JS MAX_SAFE_INTEGER
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdate(() => new Date()),
});

export const bonusEvents = pgTable('bonus_event', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  startDate: timestamp('startDate').notNull(),
  endDate: timestamp('endDate').notNull(),
  fundsExpiryDate: timestamp('fundsExpiryDate'), // Optional: when the distributed funds expire
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdate(() => new Date()),
});

// --- Racing Data System ---

export const horses = pgTable('horse', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  gender: text('gender').notNull(), // e.g., 'colt', 'filly', 'horse', 'mare'
  sireId: uuid('sireId'), // Father, self-reference possible but simpler as ID for now
  damId: uuid('damId'),   // Mother
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdate(() => new Date()),
});

export const dailySchedules = pgTable('daily_schedule', {
  id: uuid('id').defaultRandom().primaryKey(),
  date: date('date').notNull(),
  location: text('location').notNull(),
  name: text('name').notNull(), // e.g., 1回東京1日目
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdate(() => new Date()),
});

export const races = pgTable('race', {
  id: uuid('id').defaultRandom().primaryKey(),
  scheduleId: uuid('scheduleId')
    .notNull()
    .references(() => dailySchedules.id, { onDelete: 'cascade' }),
  raceNumber: integer('raceNumber').notNull(),
  name: text('name').notNull(),
  startTime: timestamp('startTime').notNull(),
  distance: integer('distance').notNull(),
  surface: text('surface').notNull(), // turf, dirt
  condition: text('condition'), // good, yielding, etc.
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdate(() => new Date()),
});

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
  weight: integer('weight'), // in 0.1kg or just kg? usually kg
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdate(() => new Date()),
});
