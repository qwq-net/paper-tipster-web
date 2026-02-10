import { describe, expect, it } from 'vitest';
import { validateBetSubmission } from './validation';

describe('validateBetSubmission', () => {
  it('正常な入力', () => {
    expect(validateBetSubmission(1, 100, 100, 1000)).toBeNull();
  });

  it('馬を選択していない (betCount=0)', () => {
    expect(validateBetSubmission(0, 100, 0, 1000)).toBe('馬を選択してください');
  });

  it('金額が100円未満', () => {
    expect(validateBetSubmission(1, 99, 99, 1000)).toBe('100円以上で入力してください');
    expect(validateBetSubmission(1, 0, 0, 1000)).toBe('100円以上で入力してください');
  });

  it('残高不足', () => {
    expect(validateBetSubmission(1, 100, 1100, 1000)).toBe('残高が不足しています');
  });

  it('残高ちょうどはOK', () => {
    expect(validateBetSubmission(1, 100, 1000, 1000)).toBeNull();
  });
});
