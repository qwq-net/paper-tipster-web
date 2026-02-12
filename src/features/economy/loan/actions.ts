'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { events, transactions, wallets } from '@/shared/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { isEligibleForLoan } from './lib/logic';

export async function borrowLoan(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });

  if (!event) {
    throw new Error('イベントが見つかりません');
  }

  if (event.status !== 'ACTIVE') {
    throw new Error('このイベントは現在開催中ではありません');
  }

  const wallet = await db.query.wallets.findFirst({
    where: and(eq(wallets.userId, userId), eq(wallets.eventId, eventId)),
  });

  if (!wallet) {
    throw new Error('ウォレットが見つかりません');
  }

  if (!isEligibleForLoan(wallet.balance, event.distributeAmount, wallet.totalLoaned > 0)) {
    if (wallet.totalLoaned > 0) {
      throw new Error('既に借り入れ済みです');
    }
    throw new Error('現在の残高では借り入れできません');
  }

  const loanAmount = event.loanAmount ?? event.distributeAmount;

  await db.transaction(async (tx) => {
    await tx
      .update(wallets)
      .set({
        balance: sql`${wallets.balance} + ${loanAmount}`,
        totalLoaned: sql`${wallets.totalLoaned} + ${loanAmount}`,
      })
      .where(eq(wallets.id, wallet.id));

    await tx.insert(transactions).values({
      walletId: wallet.id,
      type: 'LOAN',
      amount: loanAmount,
      referenceId: event.id,
    });
  });

  revalidatePath('/mypage');
  revalidatePath('/mypage/sokubet');
  revalidatePath(`/races`);
}
