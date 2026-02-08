'use server';

import { RACE_EVENTS, raceEventEmitter } from '@/lib/sse/event-emitter';
import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { events, wallets } from '@/shared/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface RankingData {
  rank: number;
  userId: string;
  name: string;
  balance: number;
  isCurrentUser: boolean;
}

export async function getEventRanking(
  eventId: string
): Promise<{ ranking: RankingData[]; published: boolean; distributeAmount: number }> {
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
    const shouldMask = !event.rankingPublished && !isCurrentUser;

    return {
      rank: index + 1,
      userId: wallet.userId,
      name: shouldMask ? '???' : wallet.user.name || 'Unknown',
      balance: wallet.balance,
      isCurrentUser,
    };
  });

  return {
    ranking,
    published: event.rankingPublished,
    distributeAmount,
  };
}

export async function toggleRankingVisibility(eventId: string, published: boolean) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  await db.update(events).set({ rankingPublished: published }).where(eq(events.id, eventId));

  let payloadRanking: RankingData[] = [];

  if (published) {
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

    payloadRanking = eventWallets.map((wallet, index) => ({
      rank: index + 1,
      userId: wallet.userId,
      name: wallet.user.name || 'Unknown',
      balance: wallet.balance,
      isCurrentUser: false,
    }));
  }

  raceEventEmitter.emit(RACE_EVENTS.RANKING_UPDATED, {
    eventId,
    published,
    ranking: published ? payloadRanking : undefined,
  });

  revalidatePath('/ranking/[eventId]', 'page');
}
