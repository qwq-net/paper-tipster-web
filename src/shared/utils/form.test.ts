import { describe, expect, it } from 'vitest';
import { getPasswordManagerIgnoreAttributes } from './form';

describe('getPasswordManagerIgnoreAttributes', () => {
  it('should return ignore attributes when ignore is true', () => {
    const attrs = getPasswordManagerIgnoreAttributes(true);
    expect(attrs).toEqual({
      'data-1p-ignore': 'true',
      'data-lpignore': 'true',
      'data-protonpass-ignore': 'true',
      autoComplete: 'off',
    });
  });

  it('should return empty object when ignore is false', () => {
    const attrs = getPasswordManagerIgnoreAttributes(false);
    expect(attrs).toEqual({});
  });
});
