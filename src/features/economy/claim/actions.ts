'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { events, transactions, wallets } from '@/shared/db/schema';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function claimEvent(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });

  if (!event) {
    throw new Error('Event not found');
  }

  if (event.status === 'COMPLETED') {
    throw new Error('Event is already completed');
  }

  const existingWallet = await db.query.wallets.findFirst({
    where: and(eq(wallets.userId, userId), eq(wallets.eventId, eventId)),
  });

  if (existingWallet) {
    throw new Error('Already joined this event');
  }

  await db.transaction(async (tx) => {
    const [newWallet] = await tx
      .insert(wallets)
      .values({
        userId,
        eventId,
        balance: event.distributeAmount,
      })
      .returning();

    await tx.insert(transactions).values({
      walletId: newWallet.id,
      type: 'DISTRIBUTION',
      amount: event.distributeAmount,
      referenceId: event.id,
    });
  });

  revalidatePath('/mypage');
}
