import { BET_TYPES } from '@/entities/bet';
import { db } from '@/shared/db';
import { ADMIN_ERRORS } from '@/shared/utils/admin';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { finalizeRace } from './finalize';

vi.mock('@/shared/utils/admin', async () => {
  const actual = await vi.importActual('@/shared/utils/admin');
  return {
    ...actual,
    requireAdmin: vi.fn(),
  };
});

vi.mock('@/shared/config/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));
vi.mock('@/shared/db', () => ({
  db: {
    transaction: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    query: {
      raceEntries: { findMany: vi.fn() },
      bets: { findMany: vi.fn() },
    },
  },
}));
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));
vi.mock('@/shared/db/schema', () => ({
  bets: { id: 'bets', raceId: 'raceId', walletId: 'walletId', status: 'status', payout: 'payout', odds: 'odds' },
  raceEntries: {
    id: 'raceEntries',
    raceId: 'raceId',
    horseId: 'horseId',
    horseNumber: 'horseNumber',
    bracketNumber: 'bracketNumber',
    finishPosition: 'finishPosition',
  },
  raceInstances: { id: 'raceInstances', status: 'status', finalizedAt: 'finalizedAt' },
  payoutResults: { raceId: 'raceId', type: 'type', combinations: 'combinations' },
  events: { id: 'events', carryoverAmount: 'carryoverAmount' },
  transactions: {},
  wallets: { id: 'wallets', balance: 'balance' },
}));

vi.mock('@/shared/lib/sse/event-emitter', () => ({
  raceEventEmitter: { emit: vi.fn() },
  RACE_EVENTS: { RACE_RESULT_UPDATED: 'RACE_RESULT_UPDATED' },
}));

describe('finalizeRace', () => {
  const insertedValues: Array<Record<string, unknown>> = [];
  const setCalls: Array<Record<string, unknown>> = [];

  const mockTx = {
    update: vi.fn().mockReturnThis(),
    set: vi.fn((...args: unknown[]) => {
      setCalls.push(args[0] as Record<string, unknown>);
      return mockTx;
    }),
    where: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn((val: Record<string, unknown>) => {
      insertedValues.push(val);
      return mockTx;
    }),
    delete: vi.fn().mockReturnThis(),
    query: {
      raceEntries: { findMany: vi.fn() },
      bets: { findMany: vi.fn() },
      raceInstances: { findFirst: vi.fn().mockResolvedValue({ guaranteedOdds: {}, eventId: 'event1' }) },
    },
  };

  const setupAdminAuth = async () => {
    const { requireAdmin } = await import('@/shared/utils/admin');
    (requireAdmin as unknown as Mock).mockResolvedValue({ user: { role: 'ADMIN' } });
  };

  const threeFinishers = [
    { id: 'e1', horseNumber: 1, bracketNumber: 1, finishPosition: 1, horse: { name: 'ホース1' } },
    { id: 'e2', horseNumber: 2, bracketNumber: 2, finishPosition: 2, horse: { name: 'ホース2' } },
    { id: 'e3', horseNumber: 3, bracketNumber: 3, finishPosition: 3, horse: { name: 'ホース3' } },
  ];

  const defaultResults = [
    { entryId: 'e1', finishPosition: 1 },
    { entryId: 'e2', finishPosition: 2 },
    { entryId: 'e3', finishPosition: 3 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    insertedValues.length = 0;
    setCalls.length = 0;
    (db.transaction as unknown as Mock).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<void>) =>
      cb(mockTx)
    );
    mockTx.query.raceInstances.findFirst.mockResolvedValue({ guaranteedOdds: {}, eventId: 'event1' });
  });

  it('管理者でないユーザーはエラーになる', async () => {
    const { requireAdmin } = await import('@/shared/utils/admin');
    (requireAdmin as unknown as Mock).mockRejectedValue(new Error(ADMIN_ERRORS.UNAUTHORIZED));
    await expect(finalizeRace('123', [])).rejects.toThrow(ADMIN_ERRORS.UNAUTHORIZED);
  });

  it('単勝: 1着馬に賭けた馬券が的中し、正しいpayoutResultsが生成される', async () => {
    await setupAdminAuth();
    mockTx.query.raceEntries.findMany.mockResolvedValue(threeFinishers);
    mockTx.query.bets.findMany.mockResolvedValue([
      { id: 'b1', amount: 100, details: { type: BET_TYPES.WIN, selections: [1] } },
      { id: 'b2', amount: 100, details: { type: BET_TYPES.WIN, selections: [2] } },
    ]);

    await finalizeRace('race1', defaultResults);

    const winInsert = insertedValues.find((v) => v.type === BET_TYPES.WIN && v.raceId === 'race1');
    expect(winInsert).toBeDefined();
    const winCombinations = winInsert!.combinations as Array<{ numbers: number[]; payout: number }>;
    const winHit = winCombinations.find((c) => JSON.stringify(c.numbers) === JSON.stringify([1]));
    expect(winHit).toBeDefined();
    expect(winHit!.payout).toBe(200);
    expect(setCalls).toEqual(expect.arrayContaining([expect.objectContaining({ status: 'CLOSED' })]));
  });

  it('馬連: 1-2着の組み合わせが順序に関係なく的中する', async () => {
    await setupAdminAuth();
    mockTx.query.raceEntries.findMany.mockResolvedValue(threeFinishers);
    mockTx.query.bets.findMany.mockResolvedValue([
      { id: 'b1', amount: 100, details: { type: BET_TYPES.QUINELLA, selections: [2, 1] } },
      { id: 'b2', amount: 100, details: { type: BET_TYPES.QUINELLA, selections: [1, 3] } },
    ]);

    await finalizeRace('race1', defaultResults);

    const quinellaInsert = insertedValues.find((v) => v.type === BET_TYPES.QUINELLA && v.raceId === 'race1');
    expect(quinellaInsert).toBeDefined();
    const combos = quinellaInsert!.combinations as Array<{ numbers: number[]; payout: number }>;
    const hitCombo = combos.find((c) => JSON.stringify([...c.numbers].sort()) === JSON.stringify([1, 2]));
    expect(hitCombo).toBeDefined();
    expect(hitCombo!.payout).toBe(200);
  });

  it('3連単: 着順通りの場合のみ的中する', async () => {
    await setupAdminAuth();
    mockTx.query.raceEntries.findMany.mockResolvedValue(threeFinishers);
    mockTx.query.bets.findMany.mockResolvedValue([
      { id: 'b1', amount: 100, details: { type: BET_TYPES.TRIFECTA, selections: [1, 2, 3] } },
      { id: 'b2', amount: 100, details: { type: BET_TYPES.TRIFECTA, selections: [1, 3, 2] } },
    ]);

    await finalizeRace('race1', defaultResults);

    const trifectaInsert = insertedValues.find((v) => v.type === BET_TYPES.TRIFECTA && v.raceId === 'race1');
    expect(trifectaInsert).toBeDefined();
    const combos = trifectaInsert!.combinations as Array<{ numbers: number[]; payout: number }>;
    const hitCombo = combos.find((c) => JSON.stringify(c.numbers) === JSON.stringify([1, 2, 3]));
    expect(hitCombo).toBeDefined();
    expect(hitCombo!.payout).toBe(200);
  });

  it('複勝: 3着以内の馬が的中し、プールが分配される', async () => {
    await setupAdminAuth();
    mockTx.query.raceEntries.findMany.mockResolvedValue(threeFinishers);
    mockTx.query.bets.findMany.mockResolvedValue([
      { id: 'b1', amount: 100, details: { type: BET_TYPES.PLACE, selections: [1] } },
      { id: 'b2', amount: 100, details: { type: BET_TYPES.PLACE, selections: [3] } },
    ]);

    await finalizeRace('race1', defaultResults);

    const placeInsert = insertedValues.find((v) => v.type === BET_TYPES.PLACE && v.raceId === 'race1');
    expect(placeInsert).toBeDefined();
    const combos = placeInsert!.combinations as Array<{ numbers: number[]; payout: number }>;
    const hit1 = combos.find((c) => JSON.stringify(c.numbers) === JSON.stringify([1]));
    const hit3 = combos.find((c) => JSON.stringify(c.numbers) === JSON.stringify([3]));
    expect(hit1).toBeDefined();
    expect(hit3).toBeDefined();
  });

  it('的中者がいない券種のプールがキャリーオーバーとして加算される', async () => {
    await setupAdminAuth();
    mockTx.query.raceEntries.findMany.mockResolvedValue(threeFinishers);
    mockTx.query.bets.findMany.mockResolvedValue([
      { id: 'b1', amount: 500, details: { type: BET_TYPES.WIN, selections: [4] } },
    ]);

    await finalizeRace('race1', defaultResults);

    const carryoverUpdate = setCalls.find((call) => 'carryoverAmount' in call);
    expect(carryoverUpdate).toBeDefined();
  });

  it('保証オッズが設定されている場合、計算倍率より保証倍率が高ければ保証倍率が採用される', async () => {
    await setupAdminAuth();
    mockTx.query.raceEntries.findMany.mockResolvedValue(threeFinishers);
    mockTx.query.raceInstances.findFirst.mockResolvedValue({
      guaranteedOdds: { [BET_TYPES.WIN]: 10.0 },
      eventId: 'event1',
    });
    mockTx.query.bets.findMany.mockResolvedValue([
      { id: 'b1', amount: 100, details: { type: BET_TYPES.WIN, selections: [1] } },
    ]);

    await finalizeRace('race1', defaultResults);

    const winInsert = insertedValues.find((v) => v.type === BET_TYPES.WIN && v.raceId === 'race1');
    expect(winInsert).toBeDefined();
    const combos = winInsert!.combinations as Array<{ numbers: number[]; payout: number }>;
    const winHit = combos.find((c) => JSON.stringify(c.numbers) === JSON.stringify([1]));
    expect(winHit).toBeDefined();
    expect(winHit!.payout).toBe(1000);
  });

  it('賭けがないレースでもデフォルト保証オッズで勝利組み合わせが生成される', async () => {
    await setupAdminAuth();
    mockTx.query.raceEntries.findMany.mockResolvedValue(threeFinishers);
    mockTx.query.bets.findMany.mockResolvedValue([]);

    await finalizeRace('race1', defaultResults);

    const winInsert = insertedValues.find((v) => v.type === BET_TYPES.WIN && v.raceId === 'race1');
    expect(winInsert).toBeDefined();
    const winCombos = winInsert!.combinations as Array<{ numbers: number[]; payout: number }>;
    const winHit = winCombos.find((c) => JSON.stringify(c.numbers) === JSON.stringify([1]));
    expect(winHit).toBeDefined();
    expect(winHit!.payout).toBe(350);
  });

  it('ワイド: 3着以内の全組み合わせで的中し、各組にオッズが設定される', async () => {
    await setupAdminAuth();
    mockTx.query.raceEntries.findMany.mockResolvedValue(threeFinishers);
    mockTx.query.bets.findMany.mockResolvedValue([
      { id: 'b1', amount: 100, details: { type: BET_TYPES.WIDE, selections: [1, 2] } },
      { id: 'b2', amount: 100, details: { type: BET_TYPES.WIDE, selections: [1, 3] } },
      { id: 'b3', amount: 100, details: { type: BET_TYPES.WIDE, selections: [2, 3] } },
    ]);

    await finalizeRace('race1', defaultResults);

    const wideInsert = insertedValues.find((v) => v.type === BET_TYPES.WIDE && v.raceId === 'race1');
    expect(wideInsert).toBeDefined();
    const combos = wideInsert!.combinations as Array<{ numbers: number[]; payout: number }>;
    expect(combos.length).toBeGreaterThanOrEqual(3);
  });

  it('複数ユーザーが同じ買い目に賭けた場合、オッズが正しく計算される', async () => {
    await setupAdminAuth();
    mockTx.query.raceEntries.findMany.mockResolvedValue(threeFinishers);
    mockTx.query.bets.findMany.mockResolvedValue([
      { id: 'b1', amount: 300, details: { type: BET_TYPES.WIN, selections: [1] } },
      { id: 'b2', amount: 200, details: { type: BET_TYPES.WIN, selections: [1] } },
      { id: 'b3', amount: 500, details: { type: BET_TYPES.WIN, selections: [2] } },
    ]);

    await finalizeRace('race1', defaultResults);

    const winInsert = insertedValues.find((v) => v.type === BET_TYPES.WIN && v.raceId === 'race1');
    expect(winInsert).toBeDefined();
    const combos = winInsert!.combinations as Array<{ numbers: number[]; payout: number }>;
    const winHit = combos.find((c) => JSON.stringify(c.numbers) === JSON.stringify([1]));
    expect(winHit).toBeDefined();
    expect(winHit!.payout).toBe(200);
  });
});
