'use server';

import { RACE_EVENTS, raceEventEmitter } from '@/lib/sse/event-emitter';
import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { events, wallets } from '@/shared/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface RankingData {
  rank: number | string;
  userId: string;
  name: string;
  balance: number | string;
  isCurrentUser: boolean;
}

export async function getEventRanking(eventId: string): Promise<{
  ranking: RankingData[];
  published: boolean;
  distributeAmount: number;
  displayMode: 'HIDDEN' | 'ANONYMOUS' | 'FULL';
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
    orderBy: [desc(wallets.balance)],
  });

  const ranking: RankingData[] = eventWallets.map((wallet, index) => {
    const isCurrentUser = wallet.userId === currentUserId;
    const isHidden = event.rankingDisplayMode === 'HIDDEN';
    const isAnonymous = event.rankingDisplayMode === 'ANONYMOUS';

    let name = wallet.user.name || 'Unknown';
    let rank: number | string = index + 1;
    let balance: number | string = wallet.balance;

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
    };
  });

  return {
    ranking,
    published: event.rankingDisplayMode !== 'HIDDEN',
    displayMode: event.rankingDisplayMode,
    distributeAmount,
  };
}

export async function updateRankingDisplayMode(eventId: string, mode: 'HIDDEN' | 'ANONYMOUS' | 'FULL') {
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
