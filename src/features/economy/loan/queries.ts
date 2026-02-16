'use server';

import { db } from '@/shared/db';
import { events, wallets } from '@/shared/db/schema';
import { and, eq } from 'drizzle-orm';

import { isEligibleForLoan } from '@/entities/wallet';

export interface LoanStatus {
  canBorrow: boolean;
  hasLoaned: boolean;
  loanAmount: number;
  balance: number;
  distributeAmount: number;
}

export async function getLoanStatus(userId: string, eventId: string): Promise<LoanStatus | null> {
  const [event, wallet] = await Promise.all([
    db.query.events.findFirst({
      where: eq(events.id, eventId),
    }),
    db.query.wallets.findFirst({
      where: and(eq(wallets.userId, userId), eq(wallets.eventId, eventId)),
    }),
  ]);

  if (!event || !wallet) {
    return null;
  }

  const loanAmount = event.loanAmount ?? event.distributeAmount;
  const hasLoaned = wallet.totalLoaned > 0;
  const canBorrow = isEligibleForLoan(wallet.balance, event.distributeAmount, hasLoaned) && event.status === 'ACTIVE';

  return {
    canBorrow,
    hasLoaned,
    loanAmount,
    balance: wallet.balance,
    distributeAmount: event.distributeAmount,
  };
}
