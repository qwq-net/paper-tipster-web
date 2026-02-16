import { describe, expect, it } from 'vitest';
import { calculateBracketNumber, getBracketColor } from './bracket';

describe('utils/bracket', () => {
  describe('getBracketColor', () => {
    it('should return correct color for valid bracket numbers', () => {
      expect(getBracketColor(1)).toContain('bg-white');
      expect(getBracketColor(2)).toContain('bg-black');
      expect(getBracketColor(8)).toContain('bg-pink-400');
    });

    it('should return gray for invalid bracket numbers', () => {
      expect(getBracketColor(null)).toContain('bg-gray-100');
      expect(getBracketColor(0)).toContain('bg-gray-100');
      expect(getBracketColor(9)).toContain('bg-gray-100');
    });
  });

  describe('calculateBracketNumber', () => {
    it('should handle 8 or fewer horses', () => {
      expect(calculateBracketNumber(1, 8)).toBe(1);
      expect(calculateBracketNumber(8, 8)).toBe(8);
    });

    it('should handle 9 to 15 horses', () => {
      expect(calculateBracketNumber(7, 9)).toBe(7);
      expect(calculateBracketNumber(8, 9)).toBe(8);
      expect(calculateBracketNumber(9, 9)).toBe(8);

      expect(calculateBracketNumber(1, 15)).toBe(1);
      expect(calculateBracketNumber(2, 15)).toBe(2);
      expect(calculateBracketNumber(3, 15)).toBe(2);
      expect(calculateBracketNumber(14, 15)).toBe(8);
      expect(calculateBracketNumber(15, 15)).toBe(8);
    });

    it('should handle 16 horses', () => {
      expect(calculateBracketNumber(1, 16)).toBe(1);
      expect(calculateBracketNumber(2, 16)).toBe(1);
      expect(calculateBracketNumber(15, 16)).toBe(8);
      expect(calculateBracketNumber(16, 16)).toBe(8);
    });

    it('should handle 17 horses', () => {
      expect(calculateBracketNumber(1, 17)).toBe(1);
      expect(calculateBracketNumber(14, 17)).toBe(7);
      expect(calculateBracketNumber(15, 17)).toBe(8);
      expect(calculateBracketNumber(17, 17)).toBe(8);
    });

    it('should handle 18 horses', () => {
      expect(calculateBracketNumber(1, 18)).toBe(1);
      expect(calculateBracketNumber(12, 18)).toBe(6);
      expect(calculateBracketNumber(13, 18)).toBe(7);
      expect(calculateBracketNumber(15, 18)).toBe(7);
      expect(calculateBracketNumber(16, 18)).toBe(8);
      expect(calculateBracketNumber(18, 18)).toBe(8);
    });
  });
});
