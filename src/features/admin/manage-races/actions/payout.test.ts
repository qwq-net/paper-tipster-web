import { BET_TYPES } from '@/entities/bet';
import { db } from '@/shared/db';
import { bets, raceInstances, transactions, wallets } from '@/shared/db/schema';
import { ADMIN_ERRORS } from '@/shared/utils/admin';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { finalizePayout } from './payout';

vi.mock('@/shared/utils/admin', async () => {
  const actual = await vi.importActual('@/shared/utils/admin');
  return {
    ...actual,
    requireAdmin: vi.fn(),
    revalidateRacePaths: vi.fn(),
  };
});

vi.mock('@/shared/config/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/shared/db', () => ({
  db: {
    query: {
      raceInstances: {
        findFirst: vi.fn(),
      },
      bets: {
        findMany: vi.fn(),
      },
    },
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
    transaction: vi.fn((cb) => cb(db)),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(),
    })),
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
  const mockTx = {
    query: {
      bets: {
        findMany: vi.fn(),
      },
    },
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
  };

  const mockDbSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (db.transaction as unknown as Mock).mockImplementation(async (cb) => cb(mockTx));
    (db.select as unknown as Mock).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: mockDbSelect,
      }),
    });
  });

  it('should throw Unauthorized if user is not admin', async () => {
    const { requireAdmin } = await import('@/shared/utils/admin');
    (requireAdmin as unknown as Mock).mockRejectedValue(new Error(ADMIN_ERRORS.UNAUTHORIZED));

    await expect(finalizePayout('race1')).rejects.toThrow(ADMIN_ERRORS.UNAUTHORIZED);
  });

  it('should throw if race not found or already finalized', async () => {
    const { requireAdmin } = await import('@/shared/utils/admin');
    (requireAdmin as unknown as Mock).mockResolvedValue({ user: { role: 'ADMIN' } });
    (db.query.raceInstances.findFirst as Mock).mockResolvedValue(null);

    await expect(finalizePayout('race1')).rejects.toThrow(ADMIN_ERRORS.NOT_FOUND);

    (db.query.raceInstances.findFirst as Mock).mockResolvedValue({ status: 'FINALIZED' });
    await expect(finalizePayout('race1')).rejects.toThrow(ADMIN_ERRORS.NOT_FOUND);
  });

  it('should process payouts correctly for HIT, LOST, and REFUNDED bets', async () => {
    const { requireAdmin, revalidateRacePaths } = await import('@/shared/utils/admin');
    const { raceEventEmitter } = await import('@/shared/lib/sse/event-emitter');

    (requireAdmin as unknown as Mock).mockResolvedValue({ user: { role: 'ADMIN' } });
    (db.query.raceInstances.findFirst as Mock).mockResolvedValue({ id: 'race1', status: 'CLOSED' });

    const payoutResultsData = [
      {
        type: BET_TYPES.WIN,
        combinations: [
          { numbers: [1], payout: 200 },
          { numbers: [0], payout: 100 },
        ],
      },
    ];
    mockDbSelect.mockResolvedValue(payoutResultsData);

    const betsData = [
      {
        id: 'bet1',
        walletId: 'wallet1',
        amount: 1000,
        details: { type: BET_TYPES.WIN, selections: [1] },
      },
      {
        id: 'bet2',
        walletId: 'wallet1',
        amount: 1000,
        details: { type: BET_TYPES.WIN, selections: [2] },
      },
    ];
    mockTx.query.bets.findMany.mockResolvedValue(betsData);

    await finalizePayout('race1');

    expect(mockTx.update).toHaveBeenCalledWith(bets);

    expect(mockTx.set).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'HIT',
        payout: 2000,
        odds: '2.0',
      })
    );

    expect(mockTx.set).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'LOST',
        payout: 0,
      })
    );

    expect(mockTx.update).toHaveBeenCalledWith(wallets);
    expect(mockTx.set).toHaveBeenCalledWith(expect.objectContaining({}));

    expect(mockTx.insert).toHaveBeenCalledWith(transactions);
    expect(mockTx.values).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          walletId: 'wallet1',
          type: 'PAYOUT',
          amount: 2000,
          referenceId: 'bet1',
        }),
      ])
    );

    expect(mockTx.update).toHaveBeenCalledWith(raceInstances);
    expect(mockTx.set).toHaveBeenCalledWith(expect.objectContaining({ status: 'FINALIZED' }));

    expect(raceEventEmitter.emit).toHaveBeenCalledWith('RACE_BROADCAST', expect.any(Object));
    expect(revalidateRacePaths).toHaveBeenCalledWith('race1');
  });
});
