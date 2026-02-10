import { BET_TYPES, BetDetail } from '@/types/betting';
import { describe, expect, it } from 'vitest';
import { Finisher, getWinningCombinations, isWinningBet } from './payout';

describe('isWinningBet (的中判定)', () => {
  const finishers: Finisher[] = [
    { horseNumber: 1, bracketNumber: 1 },
    { horseNumber: 2, bracketNumber: 2 },
    { horseNumber: 3, bracketNumber: 3 },
  ];

  it('単勝 (WIN): 1着が的中', () => {
    const hit: BetDetail = { type: BET_TYPES.WIN, selections: [1] };
    const miss: BetDetail = { type: BET_TYPES.WIN, selections: [2] };
    expect(isWinningBet(hit, finishers)).toBe(true);
    expect(isWinningBet(miss, finishers)).toBe(false);
  });

  it('複勝 (PLACE): 3着以内が的中', () => {
    expect(isWinningBet({ type: BET_TYPES.PLACE, selections: [1] }, finishers)).toBe(true);
    expect(isWinningBet({ type: BET_TYPES.PLACE, selections: [2] }, finishers)).toBe(true);
    expect(isWinningBet({ type: BET_TYPES.PLACE, selections: [3] }, finishers)).toBe(true);
    expect(isWinningBet({ type: BET_TYPES.PLACE, selections: [4] }, finishers)).toBe(false);
  });

  it('馬連 (QUINELLA): 1-2着順不同', () => {
    expect(isWinningBet({ type: BET_TYPES.QUINELLA, selections: [1, 2] }, finishers)).toBe(true);
    expect(isWinningBet({ type: BET_TYPES.QUINELLA, selections: [2, 1] }, finishers)).toBe(true);
    expect(isWinningBet({ type: BET_TYPES.QUINELLA, selections: [1, 3] }, finishers)).toBe(false);
  });

  it('馬単 (EXACTA): 1-2着順序通り', () => {
    expect(isWinningBet({ type: BET_TYPES.EXACTA, selections: [1, 2] }, finishers)).toBe(true);
    expect(isWinningBet({ type: BET_TYPES.EXACTA, selections: [2, 1] }, finishers)).toBe(false);
  });

  it('ワイド (WIDE): 3着以内の2頭', () => {
    expect(isWinningBet({ type: BET_TYPES.WIDE, selections: [1, 2] }, finishers)).toBe(true);
    expect(isWinningBet({ type: BET_TYPES.WIDE, selections: [1, 3] }, finishers)).toBe(true);
    expect(isWinningBet({ type: BET_TYPES.WIDE, selections: [2, 3] }, finishers)).toBe(true);
    expect(isWinningBet({ type: BET_TYPES.WIDE, selections: [1, 4] }, finishers)).toBe(false);
  });

  it('枠連 (BRACKET_QUINELLA): 1-2着の枠順不同', () => {
    expect(isWinningBet({ type: BET_TYPES.BRACKET_QUINELLA, selections: [1, 2] }, finishers)).toBe(true);
    expect(isWinningBet({ type: BET_TYPES.BRACKET_QUINELLA, selections: [2, 1] }, finishers)).toBe(true);
    expect(isWinningBet({ type: BET_TYPES.BRACKET_QUINELLA, selections: [1, 3] }, finishers)).toBe(false);
  });

  it('3連複 (TRIO): 1-3着順不同', () => {
    expect(isWinningBet({ type: BET_TYPES.TRIO, selections: [1, 2, 3] }, finishers)).toBe(true);
    expect(isWinningBet({ type: BET_TYPES.TRIO, selections: [3, 2, 1] }, finishers)).toBe(true);
    expect(isWinningBet({ type: BET_TYPES.TRIO, selections: [1, 2, 4] }, finishers)).toBe(false);
  });

  it('3連単 (TRIFECTA): 1-3着順序通り', () => {
    expect(isWinningBet({ type: BET_TYPES.TRIFECTA, selections: [1, 2, 3] }, finishers)).toBe(true);
    expect(isWinningBet({ type: BET_TYPES.TRIFECTA, selections: [1, 3, 2] }, finishers)).toBe(false);
  });
});

describe('getWinningCombinations (勝利組み合わせ生成)', () => {
  const finishers: Finisher[] = [
    { horseNumber: 1, bracketNumber: 1 },
    { horseNumber: 2, bracketNumber: 2 },
    { horseNumber: 3, bracketNumber: 3 },
  ];

  it('各券種の勝利組み合わせが正しいか', () => {
    expect(getWinningCombinations(BET_TYPES.WIN, finishers)).toEqual([[1]]);

    expect(getWinningCombinations(BET_TYPES.PLACE, finishers)).toEqual([[1], [2], [3]]);

    expect(getWinningCombinations(BET_TYPES.QUINELLA, finishers)).toEqual([[1, 2]]);

    expect(getWinningCombinations(BET_TYPES.EXACTA, finishers)).toEqual([[1, 2]]);

    expect(getWinningCombinations(BET_TYPES.WIDE, finishers)).toEqual([
      [1, 2],
      [1, 3],
      [2, 3],
    ]);

    expect(getWinningCombinations(BET_TYPES.TRIO, finishers)).toEqual([[1, 2, 3]]);

    expect(getWinningCombinations(BET_TYPES.TRIFECTA, finishers)).toEqual([[1, 2, 3]]);
  });

  it('フィニッシャー不足時の挙動', () => {
    const fewFinishers: Finisher[] = [{ horseNumber: 1, bracketNumber: 1 }];
    expect(getWinningCombinations(BET_TYPES.QUINELLA, fewFinishers)).toEqual([]);
    expect(getWinningCombinations(BET_TYPES.WIN, fewFinishers)).toEqual([[1]]);
  });
});
