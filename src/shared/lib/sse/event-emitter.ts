import { EventEmitter } from 'events';

class RaceEventEmitter extends EventEmitter {
  public id = Math.random().toString(36).substring(7);
  constructor() {
    super();
  }
}

const globalForEvents = global as unknown as { raceEventEmitter: RaceEventEmitter };

export const raceEventEmitter = globalForEvents.raceEventEmitter || new RaceEventEmitter();

if (process.env.NODE_ENV !== 'production') {
  globalForEvents.raceEventEmitter = raceEventEmitter;
}

export const RACE_EVENTS = {
  RACE_FINALIZED: 'RACE_FINALIZED',
  RACE_BROADCAST: 'RACE_BROADCAST',
  RACE_CLOSED: 'RACE_CLOSED',
  RACE_REOPENED: 'RACE_REOPENED',
  RACE_ODDS_UPDATED: 'RACE_ODDS_UPDATED',
  RANKING_UPDATED: 'RANKING_UPDATED',
  RACE_RESULT_UPDATED: 'RACE_RESULT_UPDATED',
} as const;

export type EventPayloads = {
  [RACE_EVENTS.RACE_FINALIZED]: { raceId: string };
  [RACE_EVENTS.RACE_BROADCAST]: { raceId: string };
  [RACE_EVENTS.RACE_CLOSED]: { raceId: string };
  [RACE_EVENTS.RACE_REOPENED]: { raceId: string };
  [RACE_EVENTS.RACE_ODDS_UPDATED]: { raceId: string; winOdds: unknown; placeOdds: unknown };
  [RACE_EVENTS.RANKING_UPDATED]: { eventId: string; mode: 'HIDDEN' | 'ANONYMOUS' | 'FULL' };
  [RACE_EVENTS.RACE_RESULT_UPDATED]: { raceId: string; results: unknown[]; timestamp: number };
};
