import { BET_TYPES } from '@/types/betting';
import { describe, expect, it } from 'vitest';
import { calculateBetCount, getValidBetCombinations } from './index';

describe('三連複（TRIO）', () => {
  it('基本ケース: {1,2} * {3,4} * {5,6} = 8点', () => {
    const selections = [
      [1, 2],
      [3, 4],
      [5, 6],
    ];
    const count = calculateBetCount(selections, BET_TYPES.TRIO);
    expect(count).toBe(8);
  });

  it('同一馬除外: {1,2} * {1,2} * {3,4} = 2点', () => {
    const selections = [
      [1, 2],
      [1, 2],
      [3, 4],
    ];
    // {1,2,3}, {1,2,4} are valid unique combinations
    const count = calculateBetCount(selections, BET_TYPES.TRIO);
    expect(count).toBe(2);
  });

  it('順序無視・重複排除: {1,2,3} * {1,2,3} * {1,2,3} = 1点', () => {
    const selections = [
      [1, 2, 3],
      [1, 2, 3],
      [1, 2, 3],
    ];
    // Only {1,2,3} is valid. All others duplicate or invalid (same horse)
    const count = calculateBetCount(selections, BET_TYPES.TRIO);
    expect(count).toBe(1);
  });

  it('入力重複あり: {1,1} * {2,2} * {3,3} = 1点', () => {
    const selections = [
      [1, 1],
      [2, 2],
      [3, 3],
    ];
    const count = calculateBetCount(selections, BET_TYPES.TRIO);
    expect(count).toBe(1);
  });

  it('組み合わせの詳細確認: {1,2} * {3,4} * {5,6}', () => {
    const selections = [
      [1, 2],
      [3, 4],
      [5, 6],
    ];
    const combinations = getValidBetCombinations(selections, BET_TYPES.TRIO);

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

  it('逆順入力でも同じ結果（同一組み合わせ）: {3,2,1} * {3,2,1} * {3,2,1} = 1点', () => {
    const selections = [
      [3, 2, 1],
      [3, 2, 1],
      [3, 2, 1],
    ];
    const count = calculateBetCount(selections, BET_TYPES.TRIO);
    expect(count).toBe(1);
  });
});
