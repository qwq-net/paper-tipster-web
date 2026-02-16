'use server';

import { calculateNetBalance } from '@/entities/wallet';
import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { events, wallets } from '@/shared/db/schema';
import { RACE_EVENTS, raceEventEmitter } from '@/shared/lib/sse/event-emitter';
import { desc, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type RankingDisplayMode = 'HIDDEN' | 'ANONYMOUS' | 'FULL' | 'FULL_WITH_LOAN';

export interface RankingData {
  rank: number | string;
  userId: string;
  name: string;
  balance: number | string;
  isCurrentUser: boolean;
  totalLoaned?: number;
}

export async function getEventRanking(eventId: string): Promise<{
  ranking: RankingData[];
  published: boolean;
  distributeAmount: number;
  displayMode: RankingDisplayMode;
}> {
  const session = await auth();
  const currentUserId = session?.user?.id;

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });

  if (!event) {
    throw new Error('Event not found');
  }

  const distributeAmount = event.distributeAmount;
  const isFullWithLoan = event.rankingDisplayMode === 'FULL_WITH_LOAN';

  const eventWallets = await db.query.wallets.findMany({
    where: eq(wallets.eventId, eventId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: isFullWithLoan ? [desc(sql`${wallets.balance} - ${wallets.totalLoaned}`)] : [desc(wallets.balance)],
  });

  const ranking: RankingData[] = eventWallets.map((wallet, index) => {
    const isCurrentUser = wallet.userId === currentUserId;
    const isHidden = event.rankingDisplayMode === 'HIDDEN';
    const isAnonymous = event.rankingDisplayMode === 'ANONYMOUS';

    let name = wallet.user.name || 'Unknown';
    let rank: number | string = index + 1;
    let balance: number | string = wallet.balance;
    let totalLoaned: number | undefined = undefined;

    if (isFullWithLoan) {
      balance = calculateNetBalance(wallet.balance, wallet.totalLoaned);
      if (wallet.totalLoaned > 0) {
        totalLoaned = wallet.totalLoaned;
      }
    }

    if (isHidden) {
      name = '???';
      rank = '?';
      balance = '???';
    } else if (isAnonymous && !isCurrentUser) {
      name = '???';
    }

    return {
      rank,
      userId: wallet.userId,
      name,
      balance,
      isCurrentUser,
      totalLoaned,
    };
  });

  return {
    ranking,
    published: event.rankingDisplayMode !== 'HIDDEN',
    displayMode: event.rankingDisplayMode,
    distributeAmount,
  };
}

export async function updateRankingDisplayMode(eventId: string, mode: RankingDisplayMode) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  await db.update(events).set({ rankingDisplayMode: mode }).where(eq(events.id, eventId));

  raceEventEmitter.emit(RACE_EVENTS.RANKING_UPDATED, {
    eventId,
    mode,
  });

  revalidatePath('/ranking/[eventId]', 'page');
}
