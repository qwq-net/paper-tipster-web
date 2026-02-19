import { calculateBet5Count, calculateBet5Dividend, isBet5Winner } from '@/entities/bet';
import { db } from '@/shared/db';
import { bet5Events, bet5Tickets, events, transactions, wallets } from '@/shared/db/schema';
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

type Bet5WinnerRow = {
  raceId: string;
  horseId: string;
};

export function resolveBet5Winners(races: string[], winnerRows: Bet5WinnerRow[]): string[] | null {
  const winnerSetByRace = new Map<string, Set<string>>();

  for (const row of winnerRows) {
    if (!winnerSetByRace.has(row.raceId)) {
      winnerSetByRace.set(row.raceId, new Set<string>());
    }
    winnerSetByRace.get(row.raceId)!.add(row.horseId);
  }

  const winners: string[] = [];
  for (const raceId of races) {
    const winnerSet = winnerSetByRace.get(raceId);
    if (!winnerSet || winnerSet.size !== 1) {
      return null;
    }
    winners.push([...winnerSet][0]);
  }

  return winners;
}

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

    const count = calculateBet5Count(selections);

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

    const sortedWinners = resolveBet5Winners(races, allWinners as Bet5WinnerRow[]);
    if (!sortedWinners) {
      return {
        success: false,
        winCount: 0,
        dividend: 0,
        totalPot: 0,
        message: 'Not all races have exactly one winner',
      };
    }

    const tickets = await tx.query.bet5Tickets.findMany({
      where: eq(bet5Tickets.bet5EventId, bet5EventId),
    });

    const totalSales = tickets.reduce((sum, t) => sum + t.amount, 0);
    const totalPot = bet5Event.initialPot + totalSales + (event.carryoverAmount || 0);

    const winningTickets = tickets.filter((t) => {
      const ticketSelections = {
        race1: t.race1HorseIds as string[],
        race2: t.race2HorseIds as string[],
        race3: t.race3HorseIds as string[],
        race4: t.race4HorseIds as string[],
        race5: t.race5HorseIds as string[],
      };
      return isBet5Winner(ticketSelections, sortedWinners);
    });

    const winCount = winningTickets.length;
    const dividend = calculateBet5Dividend(totalPot, winCount);

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

      if (Number(event.carryoverAmount) > 0) {
        await tx.update(events).set({ carryoverAmount: 0 }).where(eq(events.id, event.id));
      }
    } else {
      await tx.update(events).set({ carryoverAmount: totalPot }).where(eq(events.id, event.id));
    }

    await tx.update(bet5Events).set({ status: 'FINALIZED' }).where(eq(bet5Events.id, bet5EventId));

    return { success: true, winCount, dividend, totalPot };
  });
}
