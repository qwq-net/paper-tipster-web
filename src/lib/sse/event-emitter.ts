import { EventEmitter } from 'events';

class RaceEventEmitter extends EventEmitter {
  public id = Math.random().toString(36).substring(7);
  constructor() {
    super();
    console.log(`[SSE] EventEmitter Initialized: ${this.id}`);
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
} as const;
