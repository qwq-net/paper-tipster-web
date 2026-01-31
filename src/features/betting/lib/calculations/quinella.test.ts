import { BET_TYPES } from '@/types/betting';
import { describe, expect, it } from 'vitest';
import { calculateBetCount, getValidBetCombinations } from './index';

describe('馬連（QUINELLA）', () => {
  it('基本ケース: {1,2,9} * {2,3,8} = 8点', () => {
    const selections = [
      [1, 2, 9],
      [2, 3, 8],
    ];
    const count = calculateBetCount(selections, BET_TYPES.QUINELLA);
    expect(count).toBe(8);
  });

  it('基本ケース: {1,2} * {3,4} = 4点', () => {
    const selections = [
      [1, 2],
      [3, 4],
    ];
    const count = calculateBetCount(selections, BET_TYPES.QUINELLA);
    expect(count).toBe(4);
  });

  it('重複除去: {1,2} * {1,2} = 1点', () => {
    const selections = [
      [1, 2],
      [1, 2],
    ];
    const count = calculateBetCount(selections, BET_TYPES.QUINELLA);
    expect(count).toBe(1);
  });

  it('単一選択: {1} * {2,3} = 2点', () => {
    const selections = [[1], [2, 3]];
    const count = calculateBetCount(selections, BET_TYPES.QUINELLA);
    expect(count).toBe(2);
  });

  it('同一馬除外: {1,2,3} * {2} = 2点', () => {
    const selections = [[1, 2, 3], [2]];
    const count = calculateBetCount(selections, BET_TYPES.QUINELLA);
    expect(count).toBe(2);
  });

  it('組み合わせの詳細確認: {1,2,9} * {2,3,8}', () => {
    const selections = [
      [1, 2, 9],
      [2, 3, 8],
    ];
    const combinations = getValidBetCombinations(selections, BET_TYPES.QUINELLA);

    const normalized = combinations.map((combo) => combo.sort((a, b) => a - b));

    expect(normalized).toContainEqual([1, 2]);
    expect(normalized).toContainEqual([1, 3]);
    expect(normalized).toContainEqual([1, 8]);
    expect(normalized).toContainEqual([2, 3]);
    expect(normalized).toContainEqual([2, 8]);
    expect(normalized).toContainEqual([2, 9]);
    expect(normalized).toContainEqual([3, 9]);
    expect(normalized).toContainEqual([8, 9]);
    expect(combinations.length).toBe(8);
  });

  it('逆順入力でも同じ結果: {2,3,8} * {1,2,9} = 8点', () => {
    const selections = [
      [2, 3, 8],
      [1, 2, 9],
    ];
    const count = calculateBetCount(selections, BET_TYPES.QUINELLA);
    expect(count).toBe(8);
  });

  it('入力重複あり（パラノイアテスト）: {1,1,2} * {3,3,4} = 4点', () => {
    const selections = [
      [1, 1, 2],
      [3, 3, 4],
    ];
    const count = calculateBetCount(selections, BET_TYPES.QUINELLA);
    expect(count).toBe(4);
  });
});

describe('ワイド（WIDE）', () => {
  it('基本ケース: {1,2} * {3,4} = 4点', () => {
    const selections = [
      [1, 2],
      [3, 4],
    ];
    const count = calculateBetCount(selections, BET_TYPES.WIDE);
    expect(count).toBe(4);
  });

  it('重複除去: {1,2,3} * {2,3,4} = 6点', () => {
    const selections = [
      [1, 2, 3],
      [2, 3, 4],
    ];
    const count = calculateBetCount(selections, BET_TYPES.WIDE);
    expect(count).toBe(6);
  });

  it('大きい番号から小さい番号への流し: {9} * {1,2,3} = 3点', () => {
    const selections = [[9], [1, 2, 3]];
    const count = calculateBetCount(selections, BET_TYPES.WIDE);
    expect(count).toBe(3);
  });

  it('入力重複あり: {9,9} * {1,1} = 1点', () => {
    const selections = [
      [9, 9],
      [1, 1],
    ];
    const count = calculateBetCount(selections, BET_TYPES.WIDE);
    expect(count).toBe(1);
  });
});

describe('枠連（BRACKET_QUINELLA）', () => {
  it('基本ケース: {1,2} * {3,4} = 4点', () => {
    const selections = [
      [1, 2],
      [3, 4],
    ];
    const bracketHorseCount = new Map([
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 1],
    ]);
    const count = calculateBetCount(selections, BET_TYPES.BRACKET_QUINELLA, bracketHorseCount);
    expect(count).toBe(4);
  });

  it('ゾロ目処理: 2頭以上の枠は有効', () => {
    const selections = [
      [1, 2],
      [1, 2],
    ];
    const bracketHorseCount = new Map([
      [1, 2],
      [2, 1],
    ]);
    const count = calculateBetCount(selections, BET_TYPES.BRACKET_QUINELLA, bracketHorseCount);
    expect(count).toBe(2); // 1-1, 1-2 (2-2 is invalid)
  });

  it('ゾロ目処理: 1頭の枠は無効', () => {
    const selections = [
      [1, 2],
      [1, 2],
    ];
    const bracketHorseCount = new Map([
      [1, 1],
      [2, 1],
    ]);
    const count = calculateBetCount(selections, BET_TYPES.BRACKET_QUINELLA, bracketHorseCount);
    expect(count).toBe(1); // Only 1-2. 1-1 is invalid (count<2), 2-2 is invalid (count<2)
  });

  it('重複除去: {1,2,3} * {2,3,4} = 6点', () => {
    const selections = [
      [1, 2, 3],
      [2, 3, 4],
    ];
    const bracketHorseCount = new Map([
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 1],
    ]);
    const count = calculateBetCount(selections, BET_TYPES.BRACKET_QUINELLA, bracketHorseCount);
    expect(count).toBe(6);
  });

  it('入力重複あり: {1,1} * {2,2} = 1点', () => {
    const selections = [
      [1, 1],
      [2, 2],
    ];
    const bracketHorseCount = new Map([
      [1, 1],
      [2, 1],
    ]);
    const count = calculateBetCount(selections, BET_TYPES.BRACKET_QUINELLA, bracketHorseCount);
    expect(count).toBe(1);
  });
});
