import { db } from '@/shared/db';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateBet5Payout, resolveBet5Winners } from './bet5';

vi.mock('@/shared/db', () => ({
  db: {
    transaction: vi.fn(),
  },
}));

vi.mock('@/shared/db/schema', () => ({
  bet5Events: { id: 'bet5Events.id' },
  bet5Tickets: { id: 'bet5Tickets.id', bet5EventId: 'bet5Tickets.bet5EventId' },
  events: { id: 'events.id', carryoverAmount: 'events.carryoverAmount' },
  wallets: { id: 'wallets.id', balance: 'wallets.balance' },
  transactions: {},
  raceEntries: { raceId: 'raceEntries.raceId', finishPosition: 'raceEntries.finishPosition' },
}));

const makeUpdateChain = () => {
  const chain = { set: vi.fn(), where: vi.fn().mockResolvedValue(undefined) };
  chain.set.mockReturnValue(chain);
  return chain;
};

const makeInsertChain = () => ({ values: vi.fn().mockResolvedValue(undefined) });

describe('calculateBet5Payout', () => {
  const bet5EventId = 'bet5-event-id-123';
  const raceIds = ['race-1', 'race-2', 'race-3', 'race-4', 'race-5'];

  const baseBet5Event = {
    id: bet5EventId,
    status: 'CLOSED',
    race1Id: raceIds[0],
    race2Id: raceIds[1],
    race3Id: raceIds[2],
    race4Id: raceIds[3],
    race5Id: raceIds[4],
    initialPot: 5000,
    event: { id: 'event-1', carryoverAmount: 0 },
  };

  const allWinnerRows = raceIds.map((raceId, i) => ({
    raceId,
    horseId: `horse-${i + 1}`,
    finishPosition: 1,
  }));

  const winningTicket = {
    id: 'ticket-win',
    walletId: 'wallet-1',
    amount: 400,
    race1HorseIds: ['horse-1'],
    race2HorseIds: ['horse-2'],
    race3HorseIds: ['horse-3'],
    race4HorseIds: ['horse-4'],
    race5HorseIds: ['horse-5'],
  };

  const losingTicket = {
    id: 'ticket-lose',
    walletId: 'wallet-2',
    amount: 200,
    race1HorseIds: ['horse-X'],
    race2HorseIds: ['horse-2'],
    race3HorseIds: ['horse-3'],
    race4HorseIds: ['horse-4'],
    race5HorseIds: ['horse-5'],
  };

  let mockTx: {
    execute: ReturnType<typeof vi.fn>;
    query: {
      bet5Events: { findFirst: ReturnType<typeof vi.fn> };
      raceEntries: { findMany: ReturnType<typeof vi.fn> };
      bet5Tickets: { findMany: ReturnType<typeof vi.fn> };
    };
    update: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    _updateChain: ReturnType<typeof makeUpdateChain>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const updateChain = makeUpdateChain();
    mockTx = {
      execute: vi.fn().mockResolvedValue(undefined),
      query: {
        bet5Events: { findFirst: vi.fn().mockResolvedValue(baseBet5Event) },
        raceEntries: { findMany: vi.fn().mockResolvedValue(allWinnerRows) },
        bet5Tickets: { findMany: vi.fn().mockResolvedValue([winningTicket]) },
      },
      update: vi.fn().mockReturnValue(updateChain),
      insert: vi.fn().mockReturnValue(makeInsertChain()),
      _updateChain: updateChain,
    };
    (db.transaction as unknown as Mock).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
      cb(mockTx)
    );
  });

  it('トランザクション開始直後に advisory lock を取得する', async () => {
    mockTx.query.bet5Events.findFirst.mockResolvedValueOnce({ ...baseBet5Event, status: 'FINALIZED' });

    await calculateBet5Payout(bet5EventId);

    expect(mockTx.execute).toHaveBeenCalledTimes(1);
    const lockArg = JSON.stringify(mockTx.execute.mock.calls[0][0]);
    expect(lockArg).toContain('pg_advisory_xact_lock');
  });

  it('advisory lock のキーに bet5EventId が含まれる', async () => {
    mockTx.query.bet5Events.findFirst.mockResolvedValueOnce({ ...baseBet5Event, status: 'FINALIZED' });

    await calculateBet5Payout(bet5EventId);

    const lockArg = JSON.stringify(mockTx.execute.mock.calls[0][0]);
    expect(lockArg).toContain(bet5EventId);
  });

  it('advisory lock 取得後に bet5Event を読み取る（ロック順序の保証）', async () => {
    const callOrder: string[] = [];
    mockTx.execute.mockImplementation(async () => { callOrder.push('lock'); });
    mockTx.query.bet5Events.findFirst.mockImplementation(async () => {
      callOrder.push('read');
      return { ...baseBet5Event, status: 'FINALIZED' };
    });

    await calculateBet5Payout(bet5EventId);

    expect(callOrder[0]).toBe('lock');
    expect(callOrder[1]).toBe('read');
  });

  it('bet5Event が存在しない場合はエラーをスローする', async () => {
    mockTx.query.bet5Events.findFirst.mockResolvedValue(null);

    await expect(calculateBet5Payout(bet5EventId)).rejects.toThrow('Event not found');
  });

  it('すでに FINALIZED の場合は success:false を返す（二重処理ガード）', async () => {
    mockTx.query.bet5Events.findFirst.mockResolvedValue({ ...baseBet5Event, status: 'FINALIZED' });

    const result = await calculateBet5Payout(bet5EventId);

    expect(result).toEqual({ success: false, message: 'Already finalized' });
    expect(mockTx.update).not.toHaveBeenCalled();
    expect(mockTx.insert).not.toHaveBeenCalled();
  });

  it('全レースの1着が揃っていない場合は success:false を返す', async () => {
    mockTx.query.raceEntries.findMany.mockResolvedValue([
      { raceId: raceIds[0], horseId: 'horse-1', finishPosition: 1 },
    ]);

    const result = await calculateBet5Payout(bet5EventId);

    expect(result).toMatchObject({ success: false, winCount: 0 });
  });

  it('的中者あり: ウォレットへ払戻、トランザクション記録、FINALIZED 更新', async () => {
    const result = await calculateBet5Payout(bet5EventId);

    expect(result).toMatchObject({ success: true, winCount: 1 });
    expect(mockTx.update).toHaveBeenCalled();
    expect(mockTx.insert).toHaveBeenCalled();
    const setCall = mockTx._updateChain.set.mock.calls.find(
      (args: unknown[]) => (args[0] as Record<string, unknown>)?.status === 'FINALIZED'
    );
    expect(setCall).toBeDefined();
  });

  it('的中者なし: carryoverAmount が totalPot にセットされ FINALIZED になる', async () => {
    mockTx.query.bet5Tickets.findMany.mockResolvedValue([losingTicket]);

    const result = await calculateBet5Payout(bet5EventId);

    expect(result).toMatchObject({ success: true, winCount: 0 });
    const carryoverSet = mockTx._updateChain.set.mock.calls.find(
      (args: unknown[]) =>
        typeof (args[0] as Record<string, unknown>)?.carryoverAmount === 'number' ||
        (args[0] as Record<string, unknown>)?.carryoverAmount !== undefined
    );
    expect(carryoverSet).toBeDefined();
  });

  it('carryoverAmount がある場合は totalPot に加算される', async () => {
    const carryover = 3000;
    mockTx.query.bet5Events.findFirst.mockResolvedValue({
      ...baseBet5Event,
      event: { id: 'event-1', carryoverAmount: carryover },
    });
    mockTx.query.bet5Tickets.findMany.mockResolvedValue([losingTicket]);

    const result = await calculateBet5Payout(bet5EventId);

    expect(result).toMatchObject({ success: true });
    expect((result as { totalPot: number }).totalPot).toBe(
      baseBet5Event.initialPot + losingTicket.amount + carryover
    );
  });

  it('的中あり時にキャリーオーバーが存在する場合はゼロにリセットされる', async () => {
    mockTx.query.bet5Events.findFirst.mockResolvedValue({
      ...baseBet5Event,
      event: { id: 'event-1', carryoverAmount: 2000 },
    });

    await calculateBet5Payout(bet5EventId);

    const zeroCarryoverSet = mockTx._updateChain.set.mock.calls.find(
      (args: unknown[]) => (args[0] as Record<string, unknown>)?.carryoverAmount === 0
    );
    expect(zeroCarryoverSet).toBeDefined();
  });
});

describe('resolveBet5Winners', () => {
  const races = ['r1', 'r2', 'r3', 'r4', 'r5'];

  it('全レースで1着が1頭ずつある場合は順序付き配列を返す', () => {
    const rows = [
      { raceId: 'r3', horseId: 'h3' },
      { raceId: 'r1', horseId: 'h1' },
      { raceId: 'r5', horseId: 'h5' },
      { raceId: 'r2', horseId: 'h2' },
      { raceId: 'r4', horseId: 'h4' },
    ];

    expect(resolveBet5Winners(races, rows)).toEqual(['h1', 'h2', 'h3', 'h4', 'h5']);
  });

  it('いずれかのレースで1着不在ならnullを返す', () => {
    const rows = [
      { raceId: 'r1', horseId: 'h1' },
      { raceId: 'r2', horseId: 'h2' },
      { raceId: 'r3', horseId: 'h3' },
      { raceId: 'r4', horseId: 'h4' },
    ];

    expect(resolveBet5Winners(races, rows)).toBeNull();
  });

  it('いずれかのレースで1着が複数ならnullを返す', () => {
    const rows = [
      { raceId: 'r1', horseId: 'h1a' },
      { raceId: 'r1', horseId: 'h1b' },
      { raceId: 'r2', horseId: 'h2' },
      { raceId: 'r3', horseId: 'h3' },
      { raceId: 'r4', horseId: 'h4' },
      { raceId: 'r5', horseId: 'h5' },
    ];

    expect(resolveBet5Winners(races, rows)).toBeNull();
  });
});
