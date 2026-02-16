import { describe, expect, it } from 'vitest';
import { formatJST, parseJSTToUTC, toJSTString } from './date';

describe('utils/date', () => {
  describe('toJSTString', () => {
    it('should format date to JST string correctly', () => {
      const date = new Date('2023-01-01T00:00:00Z');
      expect(toJSTString(date)).toBe('2023-01-01T09:00');
    });

    it('should handle string input', () => {
      expect(toJSTString('2023-01-01T00:00:00Z')).toBe('2023-01-01T09:00');
    });

    it('should return empty string for null/undefined', () => {
      expect(toJSTString(null)).toBe('');
      expect(toJSTString(undefined)).toBe('');
    });
  });

  describe('parseJSTToUTC', () => {
    it('should parse JST string to UTC Date correcty', () => {
      const jstString = '2023-01-01T09:00';
      const result = parseJSTToUTC(jstString);
      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString()).toBe('2023-01-01T00:00:00.000Z');
    });

    it('should return null for invalid date string', () => {
      expect(parseJSTToUTC('invalid')).toBeNull();
    });

    it('should return null for null/undefined', () => {
      expect(parseJSTToUTC(null)).toBeNull();
    });
  });

  describe('formatJST', () => {
    it('should format date with default options (HH:mm)', () => {
      const date = new Date('2023-01-01T00:00:00Z');
      expect(formatJST(date)).toBe('09:00');
    });

    it('should format date with custom Intl options', () => {
      const date = new Date('2023-01-01T00:00:00Z');
      expect(formatJST(date, { hour: 'numeric', minute: 'numeric', second: 'numeric' })).toBe('9:00:00');
    });

    it('should handle complex Intl.DateTimeFormatOptions', () => {
      const date = new Date('2023-01-01T00:00:00Z');
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };

      expect(formatJST(date, options)).toBe('2023年1月1日');
    });

    it('should return empty string for null/undefined', () => {
      expect(formatJST(null)).toBe('');
    });
  });
});
