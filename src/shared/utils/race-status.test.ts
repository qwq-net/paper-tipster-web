import { describe, expect, it } from 'vitest';
import { getDisplayStatus } from './race-status';

describe('utils/race-status', () => {
  it('should return status as is if not CLOSED', () => {
    expect(getDisplayStatus('OPEN', false)).toBe('OPEN');
    expect(getDisplayStatus('OPEN', true)).toBe('OPEN');
  });

  it('should return status as is if CLOSED but no ranking', () => {
    expect(getDisplayStatus('CLOSED', false)).toBe('CLOSED');
  });

  it('should return RANKING_CONFIRMED if CLOSED and has ranking', () => {
    expect(getDisplayStatus('CLOSED', true)).toBe('RANKING_CONFIRMED');
  });
});
