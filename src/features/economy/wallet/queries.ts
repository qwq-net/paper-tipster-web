'use server';

import { db } from '@/shared/db';
import { transactions, wallets } from '@/shared/db/schema';
import { desc, eq } from 'drizzle-orm';

/**
 * ユーザーの全ウォレット（イベントごと）を取得
 */
export async function getEventWallets(userId: string) {
  return db.query.wallets.findMany({
    where: eq(wallets.userId, userId),
    with: {
      event: true,
    },
  });
}

/**
 * ユーザーの取引履歴を取得
 */
export async function getWalletTransactions(walletId: string) {
  return db.query.transactions.findMany({
    where: eq(transactions.walletId, walletId),
    orderBy: [desc(transactions.createdAt)],
  });
}
