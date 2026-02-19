'use server';

import { db } from '@/shared/db';
import { transactions, wallets } from '@/shared/db/schema';
import { requireUser } from '@/shared/utils/admin';
import { asc, desc, eq, inArray } from 'drizzle-orm';
import { formatChartDate, formatTransactionDate, getActionName, getTransactionDescription } from './utils';

import type { AssetHistoryPoint, EventStats } from './utils';

type StatTransaction = {
  id: string;
  type: string;
  amount: number;
  createdAt: Date;
  wallet: {
    eventId: string;
  };
  bet: {
    race: {
      name: string;
    } | null;
  } | null;
};

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

  for (const tx of allTransactions) {
    const eventId = tx.wallet.eventId;
    const eventData = eventMap.get(eventId);

    if (tx.type !== 'LOAN') {
      currentGlobalBalance += tx.amount;
    }

    const lastGlobalPoint = globalHistory[globalHistory.length - 1];
    const isSameTypeAsLastGlobal =
      lastGlobalPoint && lastGlobalPoint.type === tx.type && lastGlobalPoint.eventId === eventId;

    const eventName = eventData?.name || '';
    const actionName = getActionName(tx.type);
    const globalLabel = `${eventName} ${actionName}`;

    updateHistoryPoint(globalHistory, tx, currentGlobalBalance, isSameTypeAsLastGlobal, globalLabel, undefined, true);

    if (eventData) {
      if (!eventCurrentBalances.has(eventId)) {
        eventCurrentBalances.set(eventId, 0);
      }

      let eventBalance = eventCurrentBalances.get(eventId)!;
      if (tx.type !== 'LOAN') {
        eventBalance += tx.amount;
        eventCurrentBalances.set(eventId, eventBalance);
      }

      const lastEventPoint = eventData.history[eventData.history.length - 1];
      const txRaceName = tx.bet?.race?.name;
      const isSameTypeAsLastEvent =
        lastEventPoint && lastEventPoint.type === tx.type && lastEventPoint.raceName === txRaceName;

      const eventLabel = txRaceName ? `${txRaceName} ${actionName}` : actionName;

      updateHistoryPoint(eventData.history, tx, eventBalance, isSameTypeAsLastEvent, eventLabel, txRaceName, false);

      eventData.logs.push({
        id: tx.id,
        date: formatTransactionDate(tx.createdAt),
        type: tx.type,
        amount: tx.amount,
        description: getTransactionDescription(tx),
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

function updateHistoryPoint(
  history: AssetHistoryPoint[],
  tx: StatTransaction,
  currentBalance: number,
  shouldGroup: boolean | undefined,
  label: string,
  raceName: string | undefined,
  isGlobal: boolean
) {
  const lastPoint = history[history.length - 1];

  if (lastPoint && shouldGroup) {
    lastPoint.balance = currentBalance;
    lastPoint.amount += tx.amount;
    lastPoint.date = formatChartDate(tx.createdAt, isGlobal);
    lastPoint.timestamp = tx.createdAt.getTime();
    lastPoint.label = label;
  } else {
    history.push({
      date: formatChartDate(tx.createdAt, isGlobal),
      timestamp: tx.createdAt.getTime(),
      balance: currentBalance,
      label: label,
      amount: tx.amount,
      type: tx.type,
      eventId: tx.wallet.eventId,
      raceName: raceName,
    });
  }
}
