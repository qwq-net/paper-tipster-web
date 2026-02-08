'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { bets, raceInstances, transactions, wallets } from '@/shared/db/schema';
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

  const race = await db.query.raceInstances.findFirst({
    where: eq(raceInstances.id, raceId),
  });

  if (!race) {
    throw new Error('Race not found');
  }

  if (race.status !== 'SCHEDULED') {
    throw new Error('このレースの受付は終了しています');
  }

  if (race.closingAt && new Date() > new Date(race.closingAt)) {
    throw new Error('このレースは締切時刻を過ぎています');
  }

  if (amount <= 0) {
    throw new Error('Invalid amount');
  }

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

    await tx.insert(transactions).values({
      walletId,
      type: 'BET',
      amount: -amount,
      referenceId: newBet.id,
    });

    await tx
      .update(wallets)
      .set({
        balance: wallet.balance - amount,
      })
      .where(eq(wallets.id, walletId));
  });

  revalidatePath('/mypage');
  revalidatePath(`/races/${raceId}`);

  import('./logic/odds').then(({ calculateOdds }) => {
    calculateOdds(raceId).catch((err) => {
      console.error('Failed to calculate odds:', err);
    });
  });
}

export async function getUserBetsForRace(raceId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  return db.query.bets.findMany({
    where: (bets, { and, eq }) => and(eq(bets.userId, session.user!.id!), eq(bets.raceId, raceId)),
    with: {
      race: {
        with: {
          entries: {
            with: {
              horse: true,
            },
          },
        },
      },
    },
  });
}

export async function fetchRaceOdds(raceId: string) {
  const { getRaceOdds } = await import('./logic/odds');
  return getRaceOdds(raceId);
}
