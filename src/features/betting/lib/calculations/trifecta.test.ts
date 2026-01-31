import { BET_TYPES } from '@/types/betting';
import { describe, expect, it } from 'vitest';
import { calculateBetCount, getValidBetCombinations } from './index';

describe('三連単（TRIFECTA）', () => {
  it('基本ケース: {1,2} * {3,4} * {5,6} = 8点', () => {
    const selections = [
      [1, 2],
      [3, 4],
      [5, 6],
    ];
    const count = calculateBetCount(selections, BET_TYPES.TRIFECTA);
    expect(count).toBe(8);
  });

  it('重複除去: {1,2,3} * {2,3,4} * {3,4,5} = 14点', () => {
    const selections = [
      [1, 2, 3],
      [2, 3, 4],
      [3, 4, 5],
    ];
    const count = calculateBetCount(selections, BET_TYPES.TRIFECTA);
    expect(count).toBe(14); // Verified
  });

  it('同一馬除外: {1,2} * {1,2} * {3,4} = 4点', () => {
    const selections = [
      [1, 2],
      [1, 2],
      [3, 4],
    ];
    // 1-2-3, 1-2-4, 2-1-3, 2-1-4
    const count = calculateBetCount(selections, BET_TYPES.TRIFECTA);
    expect(count).toBe(4);
  });

  it('完全順列性: {1,2,3} * {1,2,3} * {1,2,3} = 6点', () => {
    const selections = [
      [1, 2, 3],
      [1, 2, 3],
      [1, 2, 3],
    ];
    // Permutations of 3 items = 6
    const count = calculateBetCount(selections, BET_TYPES.TRIFECTA);
    expect(count).toBe(6);
  });

  it('入力重複あり: {1,1} * {2,2} * {3,3} = 1点', () => {
    const selections = [
      [1, 1],
      [2, 2],
      [3, 3],
    ];
    const count = calculateBetCount(selections, BET_TYPES.TRIFECTA);
    expect(count).toBe(1); // 1-2-3
  });

  it('組み合わせの詳細確認: {1,2} * {3,4} * {5,6} (ソートなし)', () => {
    const selections = [
      [1, 2],
      [3, 4],
      [5, 6],
    ];
    const combinations = getValidBetCombinations(selections, BET_TYPES.TRIFECTA);

    // Expect exact sequences
    expect(combinations).toContainEqual([1, 3, 5]);
    expect(combinations).toContainEqual([1, 3, 6]);
    expect(combinations).toContainEqual([1, 4, 5]);
    expect(combinations).toContainEqual([1, 4, 6]);
    expect(combinations).toContainEqual([2, 3, 5]);
    expect(combinations).toContainEqual([2, 3, 6]);
    expect(combinations).toContainEqual([2, 4, 5]);
    expect(combinations).toContainEqual([2, 4, 6]);
    expect(combinations.length).toBe(8);
  });

  it('逆順入力でも同じ結果: {5,6} * {3,4} * {1,2} = 8点', () => {
    const selections = [
      [5, 6],
      [3, 4],
      [1, 2],
    ];
    const count = calculateBetCount(selections, BET_TYPES.TRIFECTA);
    expect(count).toBe(8);
  });
});
