import { describe, expect, it } from 'vitest';
import { resolveBet5Winners } from './bet5';

describe('resolveBet5Winners', () => {
  const races = ['r1', 'r2', 'r3', 'r4', 'r5'];

  it('全レースで1着が1頭ずつある場合は順序付き配列を返す', () => {
    const rows = [
      { raceId: 'r3', horseId: 'h3' },
      { raceId: 'r1', horseId: 'h1' },
      { raceId: 'r5', horseId: 'h5' },
      { raceId: 'r2', horseId: 'h2' },
      { raceId: 'r4', horseId: 'h4' },
    ];

    expect(resolveBet5Winners(races, rows)).toEqual(['h1', 'h2', 'h3', 'h4', 'h5']);
  });

  it('いずれかのレースで1着不在ならnullを返す', () => {
    const rows = [
      { raceId: 'r1', horseId: 'h1' },
      { raceId: 'r2', horseId: 'h2' },
      { raceId: 'r3', horseId: 'h3' },
      { raceId: 'r4', horseId: 'h4' },
    ];

    expect(resolveBet5Winners(races, rows)).toBeNull();
  });

  it('いずれかのレースで1着が複数ならnullを返す', () => {
    const rows = [
      { raceId: 'r1', horseId: 'h1a' },
      { raceId: 'r1', horseId: 'h1b' },
      { raceId: 'r2', horseId: 'h2' },
      { raceId: 'r3', horseId: 'h3' },
      { raceId: 'r4', horseId: 'h4' },
      { raceId: 'r5', horseId: 'h5' },
    ];

    expect(resolveBet5Winners(races, rows)).toBeNull();
  });
});
