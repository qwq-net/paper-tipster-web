'use server';

import { db } from '@/shared/db';
import { transactions, wallets } from '@/shared/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function getEventWallets(userId: string) {
  return db.query.wallets.findMany({
    where: eq(wallets.userId, userId),
    orderBy: [desc(wallets.createdAt)],
    with: {
      event: true,
    },
  });
}

export async function getWalletTransactions(walletId: string) {
  return db.query.transactions.findMany({
    where: eq(transactions.walletId, walletId),
    with: {
      bet: {
        with: {
          race: {
            with: {
              venue: true,
            },
          },
        },
      },
      event: true,
      bet5Ticket: {
        with: {
          bet5Event: {
            with: {
              event: true,
            },
          },
        },
      },
    },
    orderBy: [desc(transactions.createdAt)],
  });
}
