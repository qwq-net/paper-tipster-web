import { describe, expect, it } from 'vitest';
import { getPasswordManagerIgnoreAttributes } from './form';

describe('getPasswordManagerIgnoreAttributes', () => {
  it('ignoreがtrueの場合、無視属性を返すこと', () => {
    const attrs = getPasswordManagerIgnoreAttributes(true);
    expect(attrs).toEqual({
      'data-1p-ignore': 'true',
      'data-lpignore': 'true',
      'data-protonpass-ignore': 'true',
      autoComplete: 'off',
    });
  });

  it('ignoreがfalseの場合、空オブジェクトを返すこと', () => {
    const attrs = getPasswordManagerIgnoreAttributes(false);
    expect(attrs).toEqual({});
  });
});
