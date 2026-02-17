import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('utils/cn', () => {
  it('クラス名を正しくマージすること', () => {
    expect(cn('a', 'b')).toBe('a b');
    expect(cn('a', { b: true, c: false })).toBe('a b');
  });

  it('tailwind-mergeの処理ができること', () => {
    expect(cn('px-2 py-2', 'px-4')).toBe('py-2 px-4');
  });
});
