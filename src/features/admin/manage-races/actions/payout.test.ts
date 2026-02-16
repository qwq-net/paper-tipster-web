import { db } from '@/shared/db';
import { betGroups, bets, events, payoutResults, raceInstances, wallets } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { finalizePayout } from './payout';

vi.mock('@/shared/utils/admin', () => ({
  requireAdmin: vi.fn(),
  revalidateRacePaths: vi.fn(),
  ADMIN_ERRORS: {
    NOT_FOUND: 'NOT_FOUND',
  },
}));

vi.mock('@/shared/lib/sse/event-emitter', () => ({
  raceEventEmitter: {
    emit: vi.fn(),
  },
  RACE_EVENTS: {
    RACE_BROADCAST: 'RACE_BROADCAST',
  },
}));

describe('finalizePayout', () => {
  let testUserId: string;
  let eventId: string;
  let venueId: string;
  let raceId: string;
  let walletId: string;

  beforeEach(async () => {
    const user = await db.query.users.findFirst();
    if (!user) throw new Error('No user found');
    testUserId = user.id;

    const venue = await db.query.venues.findFirst();
    if (!venue) throw new Error('No venue found');
    venueId = venue.id;

    const [event] = await db
      .insert(events)
      .values({
        name: 'Test Event',
        distributeAmount: 10000,
        date: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
      })
      .returning();
    eventId = event.id;

    const [wallet] = await db
      .insert(wallets)
      .values({
        userId: testUserId,
        eventId: eventId,
        balance: 10000,
      })
      .returning();
    walletId = wallet.id;

    const [race] = await db
      .insert(raceInstances)
      .values({
        eventId: eventId,
        venueId: venueId,
        name: 'Test Race',
        date: new Date().toISOString().split('T')[0],
        distance: 2000,
        surface: 'TURF',
        status: 'CLOSED',
      })
      .returning();
    raceId = race.id;
  });

  afterEach(async () => {});

  it('should calculate payouts correctly and update wallets', async () => {
    const [betGroup] = await db
      .insert(betGroups)
      .values({
        userId: testUserId,
        raceId: raceId,
        walletId: walletId,
        type: 'WIN',
        totalAmount: 200,
      })
      .returning();

    const [betWin] = await db
      .insert(bets)
      .values({
        userId: testUserId,
        raceId: raceId,
        walletId: walletId,
        betGroupId: betGroup.id,
        details: { type: 'WIN', selections: [1] },
        amount: 100,
        status: 'PENDING',
      })
      .returning();

    const [betLose] = await db
      .insert(bets)
      .values({
        userId: testUserId,
        raceId: raceId,
        walletId: walletId,
        betGroupId: betGroup.id,
        details: { type: 'WIN', selections: [2] },
        amount: 100,
        status: 'PENDING',
      })
      .returning();

    await db.insert(payoutResults).values({
      raceId: raceId,
      type: 'WIN',
      combinations: [{ numbers: [1], payout: 250 }],
    });

    await finalizePayout(raceId);

    const updatedBetWin = await db.query.bets.findFirst({ where: eq(bets.id, betWin.id) });
    const updatedBetLose = await db.query.bets.findFirst({ where: eq(bets.id, betLose.id) });
    const updatedWallet = await db.query.wallets.findFirst({ where: eq(wallets.id, walletId) });
    const updatedRace = await db.query.raceInstances.findFirst({ where: eq(raceInstances.id, raceId) });

    expect(updatedBetWin?.status).toBe('HIT');
    expect(Number(updatedBetWin?.payout)).toBe(250);
    expect(updatedBetWin?.odds).toBe('2.5');

    expect(updatedBetLose?.status).toBe('LOST');
    expect(Number(updatedBetLose?.payout)).toBe(0);

    expect(Number(updatedWallet?.balance)).toBe(10250);

    expect(updatedRace?.status).toBe('FINALIZED');
  });
});
