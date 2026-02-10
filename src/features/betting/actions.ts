'use server';

import { db } from '@/shared/db';
import { bets, raceInstances, transactions, wallets } from '@/shared/db/schema';
import { ADMIN_ERRORS, requireUser } from '@/shared/utils/admin';
import { BetType } from '@/types/betting';
import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const BATCH_SIZE = 100;

export async function placeBets({
  raceId,
  walletId,
  betType,
  combinations,
  amountPerBet,
}: {
  raceId: string;
  walletId: string;
  betType: BetType;
  combinations: number[][];
  amountPerBet: number;
}) {
  const session = await requireUser();

  if (combinations.length === 0) {
    throw new Error(ADMIN_ERRORS.INVALID_INPUT);
  }

  if (amountPerBet <= 0) {
    throw new Error(ADMIN_ERRORS.INVALID_AMOUNT);
  }

  const totalAmount = amountPerBet * combinations.length;

  const race = await db.query.raceInstances.findFirst({
    where: eq(raceInstances.id, raceId),
  });

  if (!race) {
    throw new Error(ADMIN_ERRORS.NOT_FOUND);
  }

  if (race.status !== 'SCHEDULED') {
    throw new Error(ADMIN_ERRORS.RACE_CLOSED);
  }

  if (race.closingAt && new Date() > new Date(race.closingAt)) {
    throw new Error(ADMIN_ERRORS.DEADLINE_EXCEEDED);
  }

  const wallet = await db.query.wallets.findFirst({
    where: eq(wallets.id, walletId),
  });

  if (!wallet) {
    throw new Error(ADMIN_ERRORS.NOT_FOUND);
  }

  if (wallet.userId !== session.user!.id) {
    throw new Error(ADMIN_ERRORS.INVALID_WALLET);
  }

  if (wallet.balance < totalAmount) {
    throw new Error(ADMIN_ERRORS.INSUFFICIENT_BALANCE);
  }

  await db.transaction(async (tx) => {
    for (let i = 0; i < combinations.length; i += BATCH_SIZE) {
      const batch = combinations.slice(i, i + BATCH_SIZE);

      const insertedBets = await tx
        .insert(bets)
        .values(
          batch.map((combo) => ({
            userId: session.user!.id!,
            raceId,
            walletId,
            details: { type: betType, selections: combo },
            amount: amountPerBet,
            status: 'PENDING' as const,
          }))
        )
        .returning({ id: bets.id });

      await tx.insert(transactions).values(
        insertedBets.map((bet) => ({
          walletId,
          type: 'BET' as const,
          amount: -amountPerBet,
          referenceId: bet.id,
        }))
      );
    }

    await tx
      .update(wallets)
      .set({
        balance: sql`${wallets.balance} - ${totalAmount}`,
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
  const session = await requireUser();

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
