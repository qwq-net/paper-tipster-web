import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { claimEvent } from './actions';

vi.mock('@/shared/config/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/shared/db', () => ({
  db: {
    transaction: vi.fn(),
    query: {
      events: { findFirst: vi.fn() },
    },
  },
}));

vi.mock('@/shared/db/schema', () => ({
  events: { id: 'events.id' },
  wallets: { userId: 'wallets.userId', eventId: 'wallets.eventId' },
  transactions: {},
}));

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';

describe('claimEvent', () => {
  const userId = 'user-123';
  const eventId = 'event-456';

  const mockEvent = {
    id: eventId,
    status: 'ACTIVE',
    distributeAmount: 10000,
  };

  const makeInsertReturning = () => {
    const returning = vi.fn().mockResolvedValue([{ id: 'wallet-new' }]);
    const values = vi.fn().mockReturnValue({ returning });
    return { values, returning };
  };

  const makeInsertChain = () => ({ values: vi.fn().mockResolvedValue(undefined) });

  let mockTx: {
    execute: ReturnType<typeof vi.fn>;
    query: {
      wallets: { findFirst: ReturnType<typeof vi.fn> };
    };
    insert: ReturnType<typeof vi.fn>;
    _insertCalls: ReturnType<typeof vi.fn>[];
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (auth as unknown as Mock).mockResolvedValue({ user: { id: userId } });
    (db.query.events.findFirst as unknown as Mock).mockResolvedValue(mockEvent);

    const walletInsert = makeInsertReturning();
    const txInsert = makeInsertChain();
    let insertCallCount = 0;

    mockTx = {
      execute: vi.fn().mockResolvedValue(undefined),
      query: {
        wallets: { findFirst: vi.fn().mockResolvedValue(null) }, // ウォレット未作成
      },
      insert: vi.fn().mockImplementation(() => {
        insertCallCount++;
        // 1回目: ウォレット作成（returningあり）、2回目: トランザクション記録
        return insertCallCount === 1 ? walletInsert : txInsert;
      }),
      _insertCalls: [],
    };

    (db.transaction as unknown as Mock).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
      cb(mockTx)
    );
  });

  it('未認証ユーザーはエラーをスローする', async () => {
    (auth as unknown as Mock).mockResolvedValue(null);

    await expect(claimEvent(eventId)).rejects.toThrow('Unauthorized');
  });

  it('イベントが存在しない場合はエラーをスローする', async () => {
    (db.query.events.findFirst as unknown as Mock).mockResolvedValue(null);

    await expect(claimEvent(eventId)).rejects.toThrow('Event not found');
  });

  it('イベントがACTIVE以外の場合はエラーをスローする', async () => {
    (db.query.events.findFirst as unknown as Mock).mockResolvedValue({ ...mockEvent, status: 'FINISHED' });

    await expect(claimEvent(eventId)).rejects.toThrow('このイベントは現在開催中ではありません');
  });

  it('トランザクション内でadvisory lockを取得する', async () => {
    await claimEvent(eventId);

    expect(mockTx.execute).toHaveBeenCalledTimes(1);
    const lockArg = JSON.stringify(mockTx.execute.mock.calls[0][0]);
    expect(lockArg).toContain('pg_advisory_xact_lock');
  });

  it('advisory lockキーにuserIdとeventIdの両方が含まれる', async () => {
    await claimEvent(eventId);

    const lockArg = JSON.stringify(mockTx.execute.mock.calls[0][0]);
    expect(lockArg).toContain(userId);
    expect(lockArg).toContain(eventId);
  });

  it('既にウォレットが存在する場合は二重参加を防止する', async () => {
    mockTx.query.wallets.findFirst.mockResolvedValue({ id: 'existing-wallet' });

    await expect(claimEvent(eventId)).rejects.toThrow('Already joined this event');
  });

  it('参加成功時にウォレットがdistributeAmount分の残高で作成される', async () => {
    await claimEvent(eventId);

    expect(mockTx.insert).toHaveBeenCalled();
    const firstInsertValues = mockTx.insert.mock.results[0].value.values;
    const walletData = firstInsertValues.mock.calls[0][0];
    expect(walletData.userId).toBe(userId);
    expect(walletData.eventId).toBe(eventId);
    expect(walletData.balance).toBe(10000);
  });

  it('参加成功時にDISTRIBUTIONトランザクションが記録される', async () => {
    await claimEvent(eventId);

    // 2回目のinsertがトランザクション記録
    expect(mockTx.insert).toHaveBeenCalledTimes(2);
    const secondInsertValues = mockTx.insert.mock.results[1].value.values;
    const txData = secondInsertValues.mock.calls[0][0];
    expect(txData.type).toBe('DISTRIBUTION');
    expect(txData.amount).toBe(10000);
  });

  it('イベントステータスがトランザクション外でのみチェックされる（注意: ロック後に再チェックなし）', async () => {
    // NOTE: claim/actions.ts ではトランザクション内でイベントステータスを再チェックしていない
    // loan/actions.ts とは異なるパターン。これは意図的か要確認。
    // このテストはその挙動をドキュメント化する。
    const callOrder: string[] = [];
    mockTx.execute.mockImplementation(async () => {
      callOrder.push('lock');
    });
    mockTx.query.wallets.findFirst.mockImplementation(async () => {
      callOrder.push('readWallet');
      return null;
    });

    await claimEvent(eventId);

    // lock後にイベント再読み込みが行われないことを確認
    expect(callOrder).toEqual(['lock', 'readWallet']);
    // events.findFirst はトランザクション外のdb.queryで1回のみ呼ばれる
    expect(db.query.events.findFirst).toHaveBeenCalledTimes(1);
  });
});
