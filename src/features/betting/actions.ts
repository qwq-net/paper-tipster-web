'use server';

import { BetDetail, BetType } from '@/entities/bet';
import { db } from '@/shared/db';
import { betGroups, bets, raceInstances, transactions, wallets } from '@/shared/db/schema';
import { ADMIN_ERRORS, requireUser } from '@/shared/utils/admin';
import { isOrderSensitive } from '@/shared/utils/payout';
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
    const [betGroup] = await tx
      .insert(betGroups)
      .values({
        userId: session.user!.id!,
        raceId,
        walletId,
        type: betType,
        totalAmount,
      })
      .returning();

    for (let i = 0; i < combinations.length; i += BATCH_SIZE) {
      const batch = combinations.slice(i, i + BATCH_SIZE);

      const insertedBets = await tx
        .insert(bets)
        .values(
          batch.map((combo) => ({
            userId: session.user!.id!,
            raceId,
            walletId,
            betGroupId: betGroup.id,
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

export async function getUserBetGroupsForRace(raceId: string) {
  const session = await requireUser();

  const race = await db.query.raceInstances.findFirst({
    where: eq(raceInstances.id, raceId),
    columns: { status: true },
  });

  const groups = await db.query.betGroups.findMany({
    where: (bg, { and, eq }) => and(eq(bg.userId, session.user!.id!), eq(bg.raceId, raceId)),
    orderBy: (bg, { desc }) => [desc(bg.createdAt)],
    with: {
      bets: {
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
      },
    },
  });

  if (race?.status === 'CLOSED') {
    const { calculateAllProvisionalOdds } = await import('./logic/odds');
    const provisionalOdds = await calculateAllProvisionalOdds(raceId);

    return groups.map((group) => ({
      ...group,
      bets: group.bets.map((bet) => {
        const details = bet.details as BetDetail;
        const betType = details.type as BetType;
        const selectionKey = JSON.stringify(
          isOrderSensitive(betType) ? details.selections : [...details.selections].sort((a, b) => a - b)
        );

        const oddsValue = provisionalOdds[betType]?.[selectionKey];
        return {
          ...bet,
          odds: oddsValue ? oddsValue.toString() : bet.odds,
        };
      }),
    }));
  }

  return groups;
}

export async function fetchRaceOdds(raceId: string) {
  const { getRaceOdds } = await import('./logic/odds');
  return getRaceOdds(raceId);
}
