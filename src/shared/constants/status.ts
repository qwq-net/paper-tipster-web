export const EVENT_STATUS_LABELS = {
  SCHEDULED: '準備中',
  ACTIVE: '開催中',
  COMPLETED: '終了',
} as const;

export type EventStatus = keyof typeof EVENT_STATUS_LABELS;

export const RACE_STATUS_LABELS = {
  SCHEDULED: '出走前',
  CLOSED: '締切済み',
  FINALIZED: '払戻確定',
  CANCELLED: '中止',
} as const;

export type RaceStatus = keyof typeof RACE_STATUS_LABELS;

export function isEventStatus(status: string): status is EventStatus {
  return status in EVENT_STATUS_LABELS;
}

export function isRaceStatus(status: string): status is RaceStatus {
  return status in RACE_STATUS_LABELS;
}
