import { BET_TYPES } from '@/types/betting';
import { describe, expect, it } from 'vitest';
import { calculateBetCount, getValidBetCombinations } from './index';

describe('馬単（EXACTA）', () => {
  it('基本ケース: {1,2} * {3,4} = 4点', () => {
    const selections = [
      [1, 2],
      [3, 4],
    ];
    const count = calculateBetCount(selections, BET_TYPES.EXACTA);
    expect(count).toBe(4);
  });

  it('順序の意味: {1,2} * {1,2} = 2点', () => {
    const selections = [
      [1, 2],
      [1, 2],
    ];
    const count = calculateBetCount(selections, BET_TYPES.EXACTA);
    expect(count).toBe(2); // 1-2, 2-1 (1-1, 2-2 removed)
  });

  it('同一馬除外: {1} * {1} = 0点', () => {
    const selections = [[1], [1]];
    const count = calculateBetCount(selections, BET_TYPES.EXACTA);
    expect(count).toBe(0);
  });

  it('組み合わせの詳細確認: {1,2} * {1,2}', () => {
    const selections = [
      [1, 2],
      [1, 2],
    ];
    const combinations = getValidBetCombinations(selections, BET_TYPES.EXACTA);

    expect(combinations).toContainEqual([1, 2]);
    expect(combinations).toContainEqual([2, 1]);
    expect(combinations.length).toBe(2);
  });

  it('入力重複あり: {1,1} * {2,2} = 1点', () => {
    const selections = [
      [1, 1],
      [2, 2],
    ];
    const count = calculateBetCount(selections, BET_TYPES.EXACTA);
    expect(count).toBe(1); // 1-2
  });

  it('入力重複あり: {1,2,1} * {1,2,2} = 2点', () => {
    const selections = [
      [1, 2, 1],
      [1, 2, 2],
    ];
    // Unique: {1,2} * {1,2} -> 1-2, 2-1
    const count = calculateBetCount(selections, BET_TYPES.EXACTA);
    expect(count).toBe(2);
  });

  it('順序を考慮: {1,2} * {2,3} = 3点', () => {
    const selections = [
      [1, 2],
      [2, 3],
    ];
    const count = calculateBetCount(selections, BET_TYPES.EXACTA);
    expect(count).toBe(3);
  });

  it('同一馬除外: {1,2,3} * {2} = 2点', () => {
    const selections = [[1, 2, 3], [2]];
    const count = calculateBetCount(selections, BET_TYPES.EXACTA);
    expect(count).toBe(2);
  });

  it('組み合わせの詳細確認: {1,2} * {3,4}', () => {
    const selections = [
      [1, 2],
      [3, 4],
    ];
    const combinations = getValidBetCombinations(selections, BET_TYPES.EXACTA);

    expect(combinations).toContainEqual([1, 3]);
    expect(combinations).toContainEqual([1, 4]);
    expect(combinations).toContainEqual([2, 3]);
    expect(combinations).toContainEqual([2, 4]);
    expect(combinations.length).toBe(4);
  });
});
