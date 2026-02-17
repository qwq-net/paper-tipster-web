import { describe, expect, it } from 'vitest';
import { BET_TYPES } from '../constants';
import { calculateBetCount, generateCombinations, getValidBetCombinations } from './combinations';

describe('Combinations Logic', () => {
  describe('generateCombinations', () => {
    it('選択肢から全ての順列を生成すること', () => {
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

    it('選択肢が空の場合、空配列を返すこと', () => {
      expect(generateCombinations([[1], []])).toHaveLength(0);
      expect(generateCombinations([])).toHaveLength(0);
    });
  });

  describe('calculateBetCount', () => {
    it('単勝/複勝の点数を正しく計算すること (単一選択)', () => {
      expect(calculateBetCount([[1, 2, 3]], BET_TYPES.WIN)).toBe(3);
      expect(calculateBetCount([[1, 1, 2]], BET_TYPES.WIN)).toBe(2);
    });

    it('馬単の点数を正しく計算すること', () => {
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

    it('馬連の点数を正しく計算すること', () => {
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

    it('3連単の点数を正しく計算すること', () => {
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

    it('3連複の点数を正しく計算すること', () => {
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

    it('同枠に複数頭いる場合の枠連を正しく処理すること', () => {
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
    it('単勝/複勝に対してソートされ重複のない値を返すこと', () => {
      const result = getValidBetCombinations([[3, 1, 2, 2]], BET_TYPES.WIN);
      expect(result).toEqual([[1], [2], [3]]);
    });

    it('複合ベットに対してフィルタリングされた組み合わせを返すこと', () => {
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
