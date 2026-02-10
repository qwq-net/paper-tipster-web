import { db } from '@/shared/db';
import { ADMIN_ERRORS } from '@/shared/utils/admin';
import { BET_TYPES } from '@/types/betting';
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
  transactions: {},
  wallets: { id: 'wallets', balance: 'balance' },
}));

describe('finalizeRace', () => {
  const mockTx = {
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    query: {
      raceEntries: { findMany: vi.fn() },
      bets: { findMany: vi.fn() },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (db.transaction as unknown as Mock).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<void>) =>
      cb(mockTx)
    );
  });

  it('should throw Unauthorized if user is not admin', async () => {
    const { requireAdmin } = await import('@/shared/utils/admin');
    (requireAdmin as unknown as Mock).mockRejectedValue(new Error(ADMIN_ERRORS.UNAUTHORIZED));
    await expect(finalizeRace('123', [])).rejects.toThrow(ADMIN_ERRORS.UNAUTHORIZED);
  });

  it('should finalize race correctly', async () => {
    const { requireAdmin } = await import('@/shared/utils/admin');
    (requireAdmin as unknown as Mock).mockResolvedValue({ user: { role: 'ADMIN' } });

    mockTx.query.raceEntries.findMany.mockResolvedValue([
      { id: 'e1', horseNumber: 1, bracketNumber: 1, finishPosition: 1 },
      { id: 'e2', horseNumber: 2, bracketNumber: 2, finishPosition: 2 },
    ]);

    mockTx.query.bets.findMany.mockResolvedValue([
      {
        id: 'b1',
        amount: 100,
        details: { type: BET_TYPES.WIN, selections: [1] },
      },
      {
        id: 'b2',
        amount: 100,
        details: { type: BET_TYPES.WIN, selections: [2] },
      },
    ]);

    await finalizeRace('race1', [
      { entryId: 'e1', finishPosition: 1 },
      { entryId: 'e2', finishPosition: 2 },
    ]);

    expect(mockTx.update).toHaveBeenCalled();

    const setCalls = mockTx.set.mock.calls;
    expect(setCalls).toEqual(expect.arrayContaining([[expect.objectContaining({ status: 'CLOSED' })]]));

    expect(mockTx.insert).toHaveBeenCalled();
    expect(mockTx.values).toHaveBeenCalledWith(
      expect.objectContaining({
        raceId: 'race1',
        type: BET_TYPES.WIN,
      })
    );

    expect(mockTx.set).toHaveBeenCalledWith(expect.objectContaining({ status: 'CLOSED' }));
  });
});
