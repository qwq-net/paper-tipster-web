import { describe, expect, it } from 'vitest';
import { getDisplayGender, getGenderAge, getGenderBadgeClass } from './gender';

describe('gender utils', () => {
  describe('getGenderBadgeClass', () => {
    it('日本語のラベルに対して正しいクラスを返すこと', () => {
      expect(getGenderBadgeClass('牡')).toBe('bg-blue-100 text-blue-800');
      expect(getGenderBadgeClass('牝')).toBe('bg-pink-100 text-pink-800');
      expect(getGenderBadgeClass('セン')).toBe('bg-gray-100 text-gray-800');
    });

    it('EnumのRaw値に対して正しいクラスを返すこと', () => {
      expect(getGenderBadgeClass('HORSE')).toBe('bg-blue-100 text-blue-800');
      expect(getGenderBadgeClass('COLT')).toBe('bg-blue-100 text-blue-800');
      expect(getGenderBadgeClass('MARE')).toBe('bg-pink-100 text-pink-800');
      expect(getGenderBadgeClass('FILLY')).toBe('bg-pink-100 text-pink-800');
      expect(getGenderBadgeClass('GELDING')).toBe('bg-gray-100 text-gray-800');
    });

    it('不明な入力に対してデフォルトクラスを返すこと', () => {
      expect(getGenderBadgeClass('UNKNOWN')).toBe('bg-gray-100 text-gray-800');
    });
  });

  describe('getDisplayGender', () => {
    it('日本語の入力に対して正しいラベルを返すこと', () => {
      expect(getDisplayGender('牡')).toBe('牡');
      expect(getDisplayGender('牝')).toBe('牝');
      expect(getDisplayGender('セン')).toBe('セ');
    });

    it('EnumのRaw値を日本語ラベルにマッピングすること', () => {
      expect(getDisplayGender('HORSE')).toBe('牡');
      expect(getDisplayGender('COLT')).toBe('牡');
      expect(getDisplayGender('MARE')).toBe('牝');
      expect(getDisplayGender('FILLY')).toBe('牝');
      expect(getDisplayGender('GELDING')).toBe('セ');
    });

    it('不明な入力に対しては元の値を返すこと', () => {
      expect(getDisplayGender('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('getGenderAge', () => {
    it('性別と年齢を正しくフォーマットすること', () => {
      expect(getGenderAge('HORSE', 5)).toBe('牡5');
      expect(getGenderAge('MARE', 4)).toBe('牝4');
      expect(getGenderAge('GELDING', 6)).toBe('セ6');
    });

    it('年齢がnullの場合は性別のみをフォーマットすること', () => {
      expect(getGenderAge('HORSE', null)).toBe('牡');
      expect(getGenderAge('FILLY', null)).toBe('牝');
    });
  });
});
