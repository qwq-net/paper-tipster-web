import { format } from 'date-fns';

export type AssetHistoryPoint = {
  date: string;
  timestamp: number;
  balance: number;
  label?: string;
  amount: number;
  type?: string;
  eventId?: string;
  raceName?: string;
};

export type TransactionLog = {
  id: string;
  date: string;
  type: string;
  amount: number;
  description: string;
};

export type EventStats = {
  id: string;
  name: string;
  balance: number;
  loan: number;
  net: number;
  history: AssetHistoryPoint[];
  logs: TransactionLog[];
};

export type TransactionWithDetails = {
  type: string;
  bet: {
    race: {
      name: string;
    } | null;
  } | null;
};

export function getActionName(type: string): string {
  switch (type) {
    case 'BET':
      return '投票';
    case 'PAYOUT':
      return '払戻';
    case 'DISTRIBUTION':
      return '初期配布';
    case 'LOAN':
      return '借入';
    default:
      return type;
  }
}

export function getTransactionDescription(tx: TransactionWithDetails): string {
  const raceName = tx.bet?.race?.name;

  if (tx.type === 'BET' && raceName) {
    return `${raceName} 投票`;
  } else if (tx.type === 'PAYOUT' && raceName) {
    return `${raceName} 払戻`;
  } else if (tx.type === 'LOAN') {
    return '借入';
  } else if (tx.type === 'DISTRIBUTION') {
    return '初期配布';
  } else {
    return getActionName(tx.type);
  }
}

export function formatTransactionDate(date: Date): string {
  return format(date, 'yyyy/MM/dd HH:mm:ss');
}

export function formatChartDate(date: Date, global: boolean = false): string {
  return format(date, global ? 'yyyy-MM-dd HH:mm:ss' : 'MM/dd HH:mm:ss');
}
