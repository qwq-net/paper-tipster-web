import { describe, expect, it } from 'vitest';
import { BET_TYPES } from '../constants';
import { calculateBetCount, generateCombinations, getValidBetCombinations } from './combinations';

describe('Combinations Logic', () => {
  describe('generateCombinations', () => {
    it('should generate all permutations from selections', () => {
      const selections = [
        [1, 2],
        [3, 4],
      ];
      const result = generateCombinations(selections);
      expect(result).toHaveLength(4);
      expect(result).toContainEqual([1, 3]);
      expect(result).toContainEqual([1, 4]);
      expect(result).toContainEqual([2, 3]);
      expect(result).toContainEqual([2, 4]);
    });

    it('should return empty array if any selection is empty', () => {
      expect(generateCombinations([[1], []])).toHaveLength(0);
      expect(generateCombinations([])).toHaveLength(0);
    });
  });

  describe('calculateBetCount', () => {
    it('should calculate WIN/PLACE correctly (single selection)', () => {
      expect(calculateBetCount([[1, 2, 3]], BET_TYPES.WIN)).toBe(3);
      expect(calculateBetCount([[1, 1, 2]], BET_TYPES.WIN)).toBe(2);
    });

    it('should calculate EXACTA correctly', () => {
      expect(
        calculateBetCount(
          [
            [1, 2, 3],
            [1, 2, 3],
          ],
          BET_TYPES.EXACTA
        )
      ).toBe(6);
    });

    it('should calculate QUINELLA correctly', () => {
      expect(
        calculateBetCount(
          [
            [1, 2, 3],
            [1, 2, 3],
          ],
          BET_TYPES.QUINELLA
        )
      ).toBe(3);
    });

    it('should calculate TRIFECTA correctly', () => {
      expect(
        calculateBetCount(
          [
            [1, 2, 3],
            [1, 2, 3],
            [1, 2, 3],
          ],
          BET_TYPES.TRIFECTA
        )
      ).toBe(6);
    });

    it('should calculate TRIO correctly', () => {
      expect(
        calculateBetCount(
          [
            [1, 2, 3],
            [1, 2, 3],
            [1, 2, 3],
          ],
          BET_TYPES.TRIO
        )
      ).toBe(1);
    });

    it('should handle BRACKET_QUINELLA with multiple horses in same bracket', () => {
      const bracketCount = new Map([
        [1, 2],
        [2, 1],
      ]);
      expect(
        calculateBetCount(
          [
            [1, 2],
            [1, 2],
          ],
          BET_TYPES.BRACKET_QUINELLA,
          bracketCount
        )
      ).toBe(2);
    });
  });

  describe('getValidBetCombinations', () => {
    it('should return sorted distinct values for WIN/PLACE', () => {
      const result = getValidBetCombinations([[3, 1, 2, 2]], BET_TYPES.WIN);
      expect(result).toEqual([[1], [2], [3]]);
    });

    it('should return filtered combinations for complex bets', () => {
      const result = getValidBetCombinations(
        [
          [1, 2],
          [1, 2],
        ],
        BET_TYPES.QUINELLA
      );
      expect(result).toEqual([[1, 2]]);
    });
  });
});
