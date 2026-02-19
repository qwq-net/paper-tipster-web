'use server';

import { db } from '@/shared/db';
import { transactions, wallets } from '@/shared/db/schema';
import { requireUser } from '@/shared/utils/admin';
import { format } from 'date-fns';
import { asc, desc, eq, inArray } from 'drizzle-orm';

export interface AssetHistoryPoint {
  date: string;
  timestamp: number;
  balance: number;
  label?: string;
}

export interface EventStats {
  id: string;
  name: string;
  balance: number;
  loan: number;
  net: number;
  history: AssetHistoryPoint[];
  logs: TransactionLog[];
}

export interface TransactionLog {
  id: string;
  date: string;
  type: string;
  amount: number;
  description: string;
}

export async function getGlobalStats() {
  const session = await requireUser();
  const userId = session.user!.id!;

  const userWallets = await db.query.wallets.findMany({
    where: eq(wallets.userId, userId),
    with: {
      event: true,
    },
    orderBy: desc(wallets.createdAt),
  });

  let totalBalance = 0;
  let totalLoan = 0;

  const eventMap = new Map<string, EventStats>();
  const walletIds: string[] = [];

  for (const w of userWallets) {
    totalBalance += w.balance;
    totalLoan += w.totalLoaned;
    walletIds.push(w.id);

    eventMap.set(w.eventId, {
      id: w.eventId,
      name: w.event.name,
      balance: w.balance,
      loan: w.totalLoaned,
      net: w.balance - w.totalLoaned,
      history: [],
      logs: [],
    });
  }

  const totalNet = totalBalance - totalLoan;

  if (walletIds.length === 0) {
    return {
      globalHistory: [],
      totalBalance: 0,
      totalLoan: 0,
      totalNet: 0,
      events: [],
    };
  }

  const allTransactions = await db.query.transactions.findMany({
    where: inArray(transactions.walletId, walletIds),
    orderBy: asc(transactions.createdAt),
    with: {
      wallet: true,
      bet: {
        with: {
          race: true,
        },
      },
    },
  });

  let currentGlobalBalance = 0;
  const globalHistory: AssetHistoryPoint[] = [];

  const eventCurrentBalances = new Map<string, number>();

  if (allTransactions.length > 0) {
    const startDate = format(allTransactions[0].createdAt, 'yyyy-MM-dd HH:mm:ss');
    const startTimestamp = allTransactions[0].createdAt.getTime();

    globalHistory.push({
      date: startDate,
      timestamp: startTimestamp,
      balance: 0,
      label: 'Start',
    });
  }

  for (const tx of allTransactions) {
    const eventId = tx.wallet.eventId;
    const eventData = eventMap.get(eventId);

    if (tx.type !== 'LOAN') {
      currentGlobalBalance += tx.amount;
    }

    const description = getTransactionDescription(tx);
    const eventName = eventData?.name || '';
    const globalLabel = getGlobalLabel(description, eventName);

    globalHistory.push({
      date: format(tx.createdAt, 'yyyy-MM-dd HH:mm:ss'),
      timestamp: tx.createdAt.getTime(),
      balance: currentGlobalBalance,
      label: globalLabel,
    });

    if (eventData) {
      if (!eventCurrentBalances.has(eventId)) {
        eventCurrentBalances.set(eventId, 0);
        eventData.history.push({
          date: format(tx.createdAt, 'MM/dd HH:mm:ss'),
          timestamp: tx.createdAt.getTime() - 1,
          balance: 0,
          label: 'Start',
        });
      }

      let eventBalance = eventCurrentBalances.get(eventId)!;
      if (tx.type !== 'LOAN') {
        eventBalance += tx.amount;
        eventCurrentBalances.set(eventId, eventBalance);
      }

      eventData.history.push({
        date: format(tx.createdAt, 'MM/dd HH:mm:ss'),
        timestamp: tx.createdAt.getTime(),
        balance: eventBalance,
        label: description,
      });

      eventData.logs.push({
        id: tx.id,
        date: format(tx.createdAt, 'yyyy/MM/dd HH:mm:ss'),
        type: tx.type,
        amount: tx.amount,
        description,
      });
    }
  }

  for (const event of eventMap.values()) {
    event.logs.reverse();
  }

  return {
    globalHistory,
    totalBalance,
    totalLoan,
    totalNet,
    events: Array.from(eventMap.values()),
  };
}

type TransactionWithDetails = {
  type: string;
  bet: {
    race: {
      name: string;
    } | null;
  } | null;
};

function getTransactionDescription(tx: TransactionWithDetails): string {
  if (tx.type === 'BET' && tx.bet?.race) {
    return `${tx.bet.race.name} 投票`;
  } else if (tx.type === 'PAYOUT' && tx.bet?.race) {
    return `${tx.bet.race.name} 払戻`;
  } else if (tx.type === 'LOAN') {
    return '借入';
  } else if (tx.type === 'DISTRIBUTION') {
    return '初期配布';
  } else {
    if (tx.type === 'BET' || tx.type === 'PAYOUT') {
      return `${tx.type}`;
    } else {
      return tx.type;
    }
  }
}

function getGlobalLabel(description: string, eventName: string): string {
  if (!eventName) return description;
  if (description.includes(eventName) || description.includes('投票') || description.includes('払戻')) {
    return description;
  }
  return `${eventName} ${description}`;
}
