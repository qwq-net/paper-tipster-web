import { db } from '@/shared/db';
import { bet5Events, bet5Tickets, transactions, wallets } from '@/shared/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

export const Bet5SelectionSchema = z.object({
  race1: z.array(z.string().uuid()),
  race2: z.array(z.string().uuid()),
  race3: z.array(z.string().uuid()),
  race4: z.array(z.string().uuid()),
  race5: z.array(z.string().uuid()),
});

export type Bet5Selection = z.infer<typeof Bet5SelectionSchema>;

export async function createBet5Event({
  eventId,
  raceIds,
  initialPot,
}: {
  eventId: string;
  raceIds: [string, string, string, string, string];
  initialPot: number;
}) {
  const [bet5Event] = await db
    .insert(bet5Events)
    .values({
      eventId,
      race1Id: raceIds[0],
      race2Id: raceIds[1],
      race3Id: raceIds[2],
      race4Id: raceIds[3],
      race5Id: raceIds[4],
      initialPot,
      status: 'SCHEDULED',
    })
    .returning();
  return bet5Event;
}

export async function closeBet5Event(bet5EventId: string) {
  const [updated] = await db
    .update(bet5Events)
    .set({ status: 'CLOSED' })
    .where(eq(bet5Events.id, bet5EventId))
    .returning();
  return updated;
}

export async function placeBet5Bet({
  userId,
  bet5EventId,
  selections,
}: {
  userId: string;
  bet5EventId: string;
  selections: Bet5Selection;
}) {
  return db.transaction(async (tx) => {
    const event = await tx.query.bet5Events.findFirst({
      where: eq(bet5Events.id, bet5EventId),
    });

    if (!event) throw new Error('BET5 event not found');

    if (event.status !== 'SCHEDULED') {
      throw new Error('BET5 event is closed');
    }

    const count =
      selections.race1.length *
      selections.race2.length *
      selections.race3.length *
      selections.race4.length *
      selections.race5.length;

    if (count === 0) throw new Error('Invalid selection');
    const cost = count * 100;

    const wallet = await tx.query.wallets.findFirst({
      where: and(eq(wallets.userId, userId), eq(wallets.eventId, event.eventId)),
    });

    if (!wallet) throw new Error('Wallet not found');
    if (wallet.balance < cost) throw new Error('Insufficient balance');

    const [ticket] = await tx
      .insert(bet5Tickets)
      .values({
        bet5EventId,
        userId,
        walletId: wallet.id,
        race1HorseIds: selections.race1,
        race2HorseIds: selections.race2,
        race3HorseIds: selections.race3,
        race4HorseIds: selections.race4,
        race5HorseIds: selections.race5,
        amount: cost,
      })
      .returning();

    await tx
      .update(wallets)
      .set({ balance: sql`${wallets.balance} - ${cost}` })
      .where(eq(wallets.id, wallet.id));

    await tx.insert(transactions).values({
      walletId: wallet.id,
      type: 'BET',
      amount: -cost,
      referenceId: ticket.id,
    });

    return ticket;
  });
}

export async function calculateBet5Payout(bet5EventId: string) {
  return db.transaction(async (tx) => {
    const bet5Event = await tx.query.bet5Events.findFirst({
      where: eq(bet5Events.id, bet5EventId),
      with: {
        event: true,
      },
    });

    if (!bet5Event) throw new Error('Event not found');
    if (bet5Event.status === 'FINALIZED') return { success: false, message: 'Already finalized' };

    const event = bet5Event.event;
    const races = [bet5Event.race1Id, bet5Event.race2Id, bet5Event.race3Id, bet5Event.race4Id, bet5Event.race5Id];
    const allWinners = await tx.query.raceEntries.findMany({
      where: (raceEntries, { and, inArray, eq }) =>
        and(inArray(raceEntries.raceId, races), eq(raceEntries.finishPosition, 1)),
    });

    if (allWinners.length !== 5) {
      return { success: false, winCount: 0, dividend: 0, totalPot: 0, message: 'Not all races have a winner' };
    }

    const sortedWinners = races.map((raceId) => {
      const winner = allWinners.find((w) => w.raceId === raceId);
      if (!winner) throw new Error(`Winner not found for race ${raceId}`);
      return winner.horseId;
    });

    const tickets = await tx.query.bet5Tickets.findMany({
      where: eq(bet5Tickets.bet5EventId, bet5EventId),
    });

    const totalSales = tickets.reduce((sum, t) => sum + t.amount, 0);
    const totalPot = bet5Event.initialPot + totalSales + (event.carryoverAmount || 0);

    const winningTickets = tickets.filter((t) => {
      const r1 = t.race1HorseIds as string[];
      const r2 = t.race2HorseIds as string[];
      const r3 = t.race3HorseIds as string[];
      const r4 = t.race4HorseIds as string[];
      const r5 = t.race5HorseIds as string[];

      return (
        r1.includes(sortedWinners[0]) &&
        r2.includes(sortedWinners[1]) &&
        r3.includes(sortedWinners[2]) &&
        r4.includes(sortedWinners[3]) &&
        r5.includes(sortedWinners[4])
      );
    });

    const winCount = winningTickets.length;

    let dividend = 0;
    if (winCount > 0) {
      dividend = Math.floor(totalPot / winCount);
    }

    if (winCount > 0) {
      for (const ticket of winningTickets) {
        await tx.update(bet5Tickets).set({ isWin: true, payout: dividend }).where(eq(bet5Tickets.id, ticket.id));

        await tx
          .update(wallets)
          .set({ balance: sql`${wallets.balance} + ${dividend}` })
          .where(eq(wallets.id, ticket.walletId));

        await tx.insert(transactions).values({
          walletId: ticket.walletId,
          type: 'PAYOUT',
          amount: dividend,
          referenceId: ticket.id,
        });
      }
    }

    await tx.update(bet5Events).set({ status: 'FINALIZED' }).where(eq(bet5Events.id, bet5EventId));

    return { success: true, winCount, dividend, totalPot };
  });
}
