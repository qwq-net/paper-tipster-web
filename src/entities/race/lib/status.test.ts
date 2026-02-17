import { describe, expect, it } from 'vitest';
import { getDisplayStatus } from './status';

describe('entities/race/lib/status', () => {
  it('CLOSEDでない場合、ステータスをそのまま返すこと', () => {
    expect(getDisplayStatus('OPEN', false)).toBe('OPEN');
    expect(getDisplayStatus('OPEN', true)).toBe('OPEN');
  });

  it('CLOSEDだがランキングがない場合、ステータスをそのまま返すこと', () => {
    expect(getDisplayStatus('CLOSED', false)).toBe('CLOSED');
  });

  it('CLOSEDかつランキングがある場合、RANKING_CONFIRMEDを返すこと', () => {
    expect(getDisplayStatus('CLOSED', true)).toBe('RANKING_CONFIRMED');
  });
});
