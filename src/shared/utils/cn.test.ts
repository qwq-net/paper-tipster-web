import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('utils/cn', () => {
  it('should merge classes correctly', () => {
    expect(cn('a', 'b')).toBe('a b');
    expect(cn('a', { b: true, c: false })).toBe('a b');
  });

  it('should handle tailwind merge', () => {
    expect(cn('px-2 py-2', 'px-4')).toBe('py-2 px-4');
  });
});
