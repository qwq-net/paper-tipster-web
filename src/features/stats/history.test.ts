import { describe, expect, it } from 'vitest';
import { shouldGroupEventHistoryPoint, shouldGroupGlobalHistoryPoint } from './history';

describe('stats history grouping', () => {
  it('global: type/event/label が一致するとグルーピングする', () => {
    const lastPoint = {
      date: '2026-02-19 00:00:00',
      timestamp: 1,
      balance: 1000,
      amount: -100,
      type: 'BET',
      eventId: 'event-1',
      label: 'イベントA 1R 投票',
    };

    const transaction = { type: 'BET' };

    expect(shouldGroupGlobalHistoryPoint(lastPoint, transaction, 'event-1', 'イベントA 1R 投票')).toBe(true);
  });

  it('global: label が違うとグルーピングしない', () => {
    const lastPoint = {
      date: '2026-02-19 00:00:00',
      timestamp: 1,
      balance: 1000,
      amount: -100,
      type: 'BET',
      eventId: 'event-1',
      label: 'イベントA 2R 投票',
    };

    const transaction = { type: 'BET' };

    expect(shouldGroupGlobalHistoryPoint(lastPoint, transaction, 'event-1', 'イベントA 1R 投票')).toBe(false);
  });

  it('event: type/race/label が一致するとグルーピングする', () => {
    const lastPoint = {
      date: '02/19 00:00:00',
      timestamp: 1,
      balance: 900,
      amount: -100,
      type: 'BET',
      eventId: 'event-1',
      raceName: '1R',
      label: '1R 投票',
    };

    const transaction = { type: 'BET' };

    expect(shouldGroupEventHistoryPoint(lastPoint, transaction, '1R', '1R 投票')).toBe(true);
  });

  it('event: race が違うとグルーピングしない', () => {
    const lastPoint = {
      date: '02/19 00:00:00',
      timestamp: 1,
      balance: 900,
      amount: -100,
      type: 'BET',
      eventId: 'event-1',
      raceName: '2R',
      label: '2R 投票',
    };

    const transaction = { type: 'BET' };

    expect(shouldGroupEventHistoryPoint(lastPoint, transaction, '1R', '1R 投票')).toBe(false);
  });
});
