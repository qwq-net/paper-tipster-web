import { BET_TYPES } from '@/types/betting';
import { describe, expect, it } from 'vitest';
import { calculateBetCount, getValidBetCombinations } from './index';

describe('単勝（WIN）', () => {
  it('基本ケース: {1,2,3} = 3点', () => {
    const selections = [[1, 2, 3]];
    const count = calculateBetCount(selections, BET_TYPES.WIN);
    expect(count).toBe(3);
  });

  it('単一選択: {5} = 1点', () => {
    const selections = [[5]];
    const count = calculateBetCount(selections, BET_TYPES.WIN);
    expect(count).toBe(1);
  });

  it('大量の選択: {1,2,3,4,5,6,7,8,9,10} = 10点', () => {
    const selections = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]];
    const count = calculateBetCount(selections, BET_TYPES.WIN);
    expect(count).toBe(10);
  });

  it('組み合わせの詳細確認: {1,2,3}', () => {
    const selections = [[1, 2, 3]];
    const combinations = getValidBetCombinations(selections, BET_TYPES.WIN);

    expect(combinations).toContainEqual([1]);
    expect(combinations).toContainEqual([2]);
    expect(combinations).toContainEqual([3]);
    expect(combinations.length).toBe(3);
  });
});

describe('複勝（PLACE）', () => {
  it('基本ケース: {1,2,3} = 3点', () => {
    const selections = [[1, 2, 3]];
    const count = calculateBetCount(selections, BET_TYPES.PLACE);
    expect(count).toBe(3);
  });

  it('単一選択: {7} = 1点', () => {
    const selections = [[7]];
    const count = calculateBetCount(selections, BET_TYPES.PLACE);
    expect(count).toBe(1);
  });

  it('大量の選択: {1,2,3,4,5,6,7,8,9,10} = 10点', () => {
    const selections = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]];
    const count = calculateBetCount(selections, BET_TYPES.PLACE);
    expect(count).toBe(10);
  });

  it('組み合わせの詳細確認: {4,5,6}', () => {
    const selections = [[4, 5, 6]];
    const combinations = getValidBetCombinations(selections, BET_TYPES.PLACE);

    expect(combinations).toContainEqual([4]);
    expect(combinations).toContainEqual([5]);
    expect(combinations).toContainEqual([6]);
    expect(combinations.length).toBe(3);
  });
});

describe('エッジケース', () => {
  describe('空配列・選択なし', () => {
    it('空の選択: [] = 0点', () => {
      const selections: number[][] = [[]];
      const count = calculateBetCount(selections, BET_TYPES.QUINELLA);
      expect(count).toBe(0);
    });

    it('選択なし: [] * [] = 0点', () => {
      const selections: number[][] = [[], []];
      const count = calculateBetCount(selections, BET_TYPES.QUINELLA);
      expect(count).toBe(0);
    });

    it('3列すべて空: [] * [] * [] = 0点', () => {
      const selections: number[][] = [[], [], []];
      const count = calculateBetCount(selections, BET_TYPES.TRIFECTA);
      expect(count).toBe(0);
    });

    it('一部が空: {1,2} * [] = 0点', () => {
      const selections: number[][] = [[1, 2], []];
      const count = calculateBetCount(selections, BET_TYPES.QUINELLA);
      expect(count).toBe(0);
    });

    it('単勝で空: [] = 0点', () => {
      const selections: number[][] = [[]];
      const count = calculateBetCount(selections, BET_TYPES.WIN);
      expect(count).toBe(0);
    });
  });

  describe('大量の選択', () => {
    it('馬連: {1,2,3,4,5} * {6,7,8,9,10} = 25点', () => {
      const selections = [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
      ];
      const count = calculateBetCount(selections, BET_TYPES.QUINELLA);
      expect(count).toBe(25);
    });

    it('馬単: {1,2,3,4,5} * {6,7,8,9,10} = 25点', () => {
      const selections = [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
      ];
      const count = calculateBetCount(selections, BET_TYPES.EXACTA);
      expect(count).toBe(25);
    });

    it('3連複: {1,2,3} * {4,5,6} * {7,8,9} = 27点', () => {
      const selections = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      const count = calculateBetCount(selections, BET_TYPES.TRIO);
      expect(count).toBe(27);
    });

    it('3連単: {1,2,3} * {4,5,6} * {7,8,9} = 27点', () => {
      const selections = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      const count = calculateBetCount(selections, BET_TYPES.TRIFECTA);
      expect(count).toBe(27);
    });
  });

  describe('すべて同じ馬', () => {
    it('馬連: {1} * {1} = 0点（同一馬除外）', () => {
      const selections = [[1], [1]];
      const count = calculateBetCount(selections, BET_TYPES.QUINELLA);
      expect(count).toBe(0);
    });

    it('馬単: {1} * {1} = 0点（同一馬除外）', () => {
      const selections = [[1], [1]];
      const count = calculateBetCount(selections, BET_TYPES.EXACTA);
      expect(count).toBe(0);
    });

    it('3連複: {1} * {1} * {1} = 0点（同一馬除外）', () => {
      const selections = [[1], [1], [1]];
      const count = calculateBetCount(selections, BET_TYPES.TRIO);
      expect(count).toBe(0);
    });

    it('3連単: {1} * {1} * {1} = 0点（同一馬除外）', () => {
      const selections = [[1], [1], [1]];
      const count = calculateBetCount(selections, BET_TYPES.TRIFECTA);
      expect(count).toBe(0);
    });
  });

  describe('重複した馬番（ロジック修正確認）', () => {
    it('馬連: {1,1,2} * {3,4} = 4点（重複は一意にしてから計算）', () => {
      const selections = [
        [1, 1, 2],
        [3, 4],
      ];
      const count = calculateBetCount(selections, BET_TYPES.QUINELLA);
      expect(count).toBe(4);
    });

    it('馬単: {1,1} * {3} = 1点（重複排除）', () => {
      const selections = [
        [1, 1], // effectively [1]
        [3],
      ];
      const count = calculateBetCount(selections, BET_TYPES.EXACTA);
      expect(count).toBe(1);
    });

    it('単勝: {1,1,1,2,2,3} = 3点（ユニーク数）', () => {
      const selections = [[1, 1, 1, 2, 2, 3]];
      const count = calculateBetCount(selections, BET_TYPES.WIN);
      expect(count).toBe(3);
    });

    it('複勝: {1,1} = 1点', () => {
      const selections = [[1, 1]];
      const count = calculateBetCount(selections, BET_TYPES.PLACE);
      expect(count).toBe(1);
    });

    it('3連単: {1,1} * {2,2} * {3,3} = 1点', () => {
      const selections = [
        [1, 1],
        [2, 2],
        [3, 3],
      ];
      const count = calculateBetCount(selections, BET_TYPES.TRIFECTA);
      expect(count).toBe(1);
    });
  });

  describe('境界値', () => {
    it('最小の馬番: {1} * {2} = 1点', () => {
      const selections = [[1], [2]];
      const count = calculateBetCount(selections, BET_TYPES.QUINELLA);
      expect(count).toBe(1);
    });

    it('大きな馬番: {99} * {100} = 1点', () => {
      const selections = [[99], [100]];
      const count = calculateBetCount(selections, BET_TYPES.QUINELLA);
      expect(count).toBe(1);
    });

    it('18頭立て全頭流し（単勝）: 18点', () => {
      const selections = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]];
      const count = calculateBetCount(selections, BET_TYPES.WIN);
      expect(count).toBe(18);
    });

    it('18頭立て全頭ボックス（馬連）: 153点', () => {
      const selections = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
      ];
      const count = calculateBetCount(selections, BET_TYPES.QUINELLA);
      expect(count).toBe(153);
    });
  });

  describe('順序のテスト', () => {
    it('馬連: 順序が異なっても同じ結果', () => {
      const selections1 = [
        [1, 2, 3],
        [4, 5, 6],
      ];
      const selections2 = [
        [6, 5, 4],
        [3, 2, 1],
      ];
      const count1 = calculateBetCount(selections1, BET_TYPES.QUINELLA);
      const count2 = calculateBetCount(selections2, BET_TYPES.QUINELLA);
      expect(count1).toBe(count2);
      expect(count1).toBe(9);
    });

    it('馬単: 順序が異なると結果も異なる', () => {
      const selections1 = [
        [1, 2],
        [3, 4],
      ];
      const selections2 = [
        [3, 4],
        [1, 2],
      ];
      const count1 = calculateBetCount(selections1, BET_TYPES.EXACTA);
      const count2 = calculateBetCount(selections2, BET_TYPES.EXACTA);
      expect(count1).toBe(4);
      expect(count2).toBe(4);

      const combos1 = getValidBetCombinations(selections1, BET_TYPES.EXACTA);
      const combos2 = getValidBetCombinations(selections2, BET_TYPES.EXACTA);
      expect(combos1).toContainEqual([1, 3]);
      expect(combos2).toContainEqual([3, 1]);
    });
  });
});
