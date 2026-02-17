import { db } from '@/shared/db';
import { betGroups, bets, events, payoutResults, raceInstances, transactions, wallets } from '@/shared/db/schema';
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

  const createdBetGroupIds: string[] = [];
  const createdBetIds: string[] = [];

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

    createdBetGroupIds.length = 0;
    createdBetIds.length = 0;
  });

  afterEach(async () => {
    for (const betId of createdBetIds) {
      await db.delete(transactions).where(eq(transactions.referenceId, betId));
    }
    for (const betId of createdBetIds) {
      await db.delete(bets).where(eq(bets.id, betId));
    }
    for (const groupId of createdBetGroupIds) {
      await db.delete(betGroups).where(eq(betGroups.id, groupId));
    }
    if (raceId) {
      await db.delete(payoutResults).where(eq(payoutResults.raceId, raceId));
      await db.delete(raceInstances).where(eq(raceInstances.id, raceId));
    }
    if (walletId) {
      await db.delete(wallets).where(eq(wallets.id, walletId));
    }
    if (eventId) {
      await db.delete(events).where(eq(events.id, eventId));
    }
  });

  async function createBet(params: {
    type: string;
    selections: number[];
    amount: number;
    userId?: string;
    walletIdOverride?: string;
  }) {
    const uid = params.userId ?? testUserId;
    const wid = params.walletIdOverride ?? walletId;

    const [betGroup] = await db
      .insert(betGroups)
      .values({
        userId: uid,
        raceId: raceId,
        walletId: wid,
        type: params.type,
        totalAmount: params.amount,
      })
      .returning();
    createdBetGroupIds.push(betGroup.id);

    const [bet] = await db
      .insert(bets)
      .values({
        userId: uid,
        raceId: raceId,
        walletId: wid,
        betGroupId: betGroup.id,
        details: { type: params.type, selections: params.selections },
        amount: params.amount,
        status: 'PENDING',
      })
      .returning();
    createdBetIds.push(bet.id);

    return { betGroup, bet };
  }

  it('単勝: 的中・不的中の判定、オッズ計算、ウォレット更新が正しく行われる', async () => {
    const { bet: betWin } = await createBet({ type: 'WIN', selections: [1], amount: 100 });
    const { bet: betLose } = await createBet({ type: 'WIN', selections: [2], amount: 100 });

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

  it('馬連: 順不同で的中判定が正しく行われる', async () => {
    const { bet: betHit } = await createBet({ type: 'quinella', selections: [2, 1], amount: 200 });
    const { bet: betMiss } = await createBet({ type: 'quinella', selections: [1, 3], amount: 200 });

    await db.insert(payoutResults).values({
      raceId: raceId,
      type: 'quinella',
      combinations: [{ numbers: [1, 2], payout: 1500 }],
    });

    await finalizePayout(raceId);

    const updatedHit = await db.query.bets.findFirst({ where: eq(bets.id, betHit.id) });
    const updatedMiss = await db.query.bets.findFirst({ where: eq(bets.id, betMiss.id) });
    const updatedWallet = await db.query.wallets.findFirst({ where: eq(wallets.id, walletId) });

    expect(updatedHit?.status).toBe('HIT');
    expect(Number(updatedHit?.payout)).toBe(3000);
    expect(updatedHit?.odds).toBe('15.0');

    expect(updatedMiss?.status).toBe('LOST');
    expect(Number(updatedMiss?.payout)).toBe(0);

    expect(Number(updatedWallet?.balance)).toBe(13000);
  });

  it('3連単: 着順通りの場合のみ的中し、高オッズが適用される', async () => {
    const { bet: betHit } = await createBet({ type: 'trifecta', selections: [1, 2, 3], amount: 100 });
    const { bet: betMiss } = await createBet({ type: 'trifecta', selections: [1, 3, 2], amount: 100 });

    await db.insert(payoutResults).values({
      raceId: raceId,
      type: 'trifecta',
      combinations: [{ numbers: [1, 2, 3], payout: 20000 }],
    });

    await finalizePayout(raceId);

    const updatedHit = await db.query.bets.findFirst({ where: eq(bets.id, betHit.id) });
    const updatedMiss = await db.query.bets.findFirst({ where: eq(bets.id, betMiss.id) });
    const updatedWallet = await db.query.wallets.findFirst({ where: eq(wallets.id, walletId) });

    expect(updatedHit?.status).toBe('HIT');
    expect(Number(updatedHit?.payout)).toBe(20000);
    expect(updatedHit?.odds).toBe('200.0');

    expect(updatedMiss?.status).toBe('LOST');

    expect(Number(updatedWallet?.balance)).toBe(30000);
  });

  it('全員ハズレの場合: 全ベットが LOST、ウォレットは変化なし', async () => {
    const { bet: bet1 } = await createBet({ type: 'WIN', selections: [4], amount: 300 });
    const { bet: bet2 } = await createBet({ type: 'WIN', selections: [5], amount: 200 });

    await db.insert(payoutResults).values({
      raceId: raceId,
      type: 'WIN',
      combinations: [{ numbers: [1], payout: 350 }],
    });

    await finalizePayout(raceId);

    const updatedBet1 = await db.query.bets.findFirst({ where: eq(bets.id, bet1.id) });
    const updatedBet2 = await db.query.bets.findFirst({ where: eq(bets.id, bet2.id) });
    const updatedWallet = await db.query.wallets.findFirst({ where: eq(wallets.id, walletId) });
    const updatedRace = await db.query.raceInstances.findFirst({ where: eq(raceInstances.id, raceId) });

    expect(updatedBet1?.status).toBe('LOST');
    expect(updatedBet2?.status).toBe('LOST');
    expect(Number(updatedBet1?.payout)).toBe(0);
    expect(Number(updatedBet2?.payout)).toBe(0);
    expect(Number(updatedWallet?.balance)).toBe(10000);
    expect(updatedRace?.status).toBe('FINALIZED');
  });

  it('賭けがないレース: ベット処理なしでFINALIZEDに更新される', async () => {
    await finalizePayout(raceId);

    const updatedRace = await db.query.raceInstances.findFirst({ where: eq(raceInstances.id, raceId) });
    const updatedWallet = await db.query.wallets.findFirst({ where: eq(wallets.id, walletId) });

    expect(updatedRace?.status).toBe('FINALIZED');
    expect(Number(updatedWallet?.balance)).toBe(10000);
  });

  it('的中した馬券にはPAYOUTトランザクションが記録される', async () => {
    const { bet: betWin } = await createBet({ type: 'WIN', selections: [1], amount: 100 });

    await db.insert(payoutResults).values({
      raceId: raceId,
      type: 'WIN',
      combinations: [{ numbers: [1], payout: 500 }],
    });

    await finalizePayout(raceId);

    const txRecord = await db.query.transactions.findFirst({
      where: eq(transactions.referenceId, betWin.id),
    });

    expect(txRecord).toBeDefined();
    expect(txRecord?.type).toBe('PAYOUT');
    expect(Number(txRecord?.amount)).toBe(500);
    expect(txRecord?.walletId).toBe(walletId);
  });

  it('既にFINALIZED済みのレースはエラーになる', async () => {
    await db.update(raceInstances).set({ status: 'FINALIZED' }).where(eq(raceInstances.id, raceId));
    await expect(finalizePayout(raceId)).rejects.toThrow('NOT_FOUND');
  });

  it('存在しないレースIDではエラーになる', async () => {
    await expect(finalizePayout('00000000-0000-0000-0000-000000000000')).rejects.toThrow();
  });

  it('ワイド: 複数の的中組み合わせが正しく処理される', async () => {
    const { bet: betWide12 } = await createBet({ type: 'wide', selections: [1, 2], amount: 100 });
    const { bet: betWide23 } = await createBet({ type: 'wide', selections: [2, 3], amount: 100 });
    const { bet: betWide14 } = await createBet({ type: 'wide', selections: [1, 4], amount: 100 });

    await db.insert(payoutResults).values({
      raceId: raceId,
      type: 'wide',
      combinations: [
        { numbers: [1, 2], payout: 300 },
        { numbers: [1, 3], payout: 500 },
        { numbers: [2, 3], payout: 800 },
      ],
    });

    await finalizePayout(raceId);

    const updated12 = await db.query.bets.findFirst({ where: eq(bets.id, betWide12.id) });
    const updated23 = await db.query.bets.findFirst({ where: eq(bets.id, betWide23.id) });
    const updated14 = await db.query.bets.findFirst({ where: eq(bets.id, betWide14.id) });
    const updatedWallet = await db.query.wallets.findFirst({ where: eq(wallets.id, walletId) });

    expect(updated12?.status).toBe('HIT');
    expect(Number(updated12?.payout)).toBe(300);
    expect(updated12?.odds).toBe('3.0');

    expect(updated23?.status).toBe('HIT');
    expect(Number(updated23?.payout)).toBe(800);
    expect(updated23?.odds).toBe('8.0');

    expect(updated14?.status).toBe('LOST');

    expect(Number(updatedWallet?.balance)).toBe(11100);
  });
});
