'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { bets, transactions, wallets } from '@/shared/db/schema';
import { BetDetail } from '@/types/betting';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function placeBet({
  raceId,
  walletId,
  details,
  amount,
}: {
  raceId: string;
  walletId: string;
  details: BetDetail;
  amount: number;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  if (amount <= 0) {
    throw new Error('Invalid amount');
  }

  // ウォレットの存在と残高確認
  const wallet = await db.query.wallets.findFirst({
    where: eq(wallets.id, walletId),
  });

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  if (wallet.userId !== session.user.id) {
    throw new Error('Unauthorized wallet');
  }

  if (wallet.balance < amount) {
    throw new Error('Insufficient balance');
  }

  await db.transaction(async (tx) => {
    // 1. 馬券データを保存
    const [newBet] = await tx
      .insert(bets)
      .values({
        userId: session.user!.id!,
        raceId,
        walletId,
        details,
        amount,
        status: 'PENDING',
      })
      .returning();

    // 2. 取引履歴を記録
    await tx.insert(transactions).values({
      walletId,
      type: 'BET',
      amount: -amount, // 出金なのでマイナス
      referenceId: newBet.id,
    });

    // 3. ウォレット残高を更新
    await tx
      .update(wallets)
      .set({
        balance: wallet.balance - amount,
      })
      .where(eq(wallets.id, walletId));
  });

  revalidatePath('/mypage');
  revalidatePath(`/races/${raceId}`);
}
