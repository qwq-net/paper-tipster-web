import type { AssetHistoryPoint } from './utils';

type HistoryGroupingTransaction = {
  type: string;
};

export function shouldGroupGlobalHistoryPoint(
  lastPoint: AssetHistoryPoint | undefined,
  transaction: HistoryGroupingTransaction,
  eventId: string,
  label: string
): boolean {
  if (!lastPoint) return false;
  return lastPoint.type === transaction.type && lastPoint.eventId === eventId && lastPoint.label === label;
}

export function shouldGroupEventHistoryPoint(
  lastPoint: AssetHistoryPoint | undefined,
  transaction: HistoryGroupingTransaction,
  raceName: string | undefined,
  label: string
): boolean {
  if (!lastPoint) return false;
  return lastPoint.type === transaction.type && lastPoint.raceName === raceName && lastPoint.label === label;
}
