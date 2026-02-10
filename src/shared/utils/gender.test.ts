import { describe, expect, it } from 'vitest';
import { getDisplayGender, getGenderAge, getGenderBadgeClass } from './gender';

describe('gender utils', () => {
  describe('getGenderBadgeClass', () => {
    it('should return correct classes for Japanese labels', () => {
      expect(getGenderBadgeClass('牡')).toBe('bg-blue-100 text-blue-800');
      expect(getGenderBadgeClass('牝')).toBe('bg-pink-100 text-pink-800');
      expect(getGenderBadgeClass('セン')).toBe('bg-gray-100 text-gray-800');
    });

    it('should return correct classes for Raw Enum values', () => {
      expect(getGenderBadgeClass('HORSE')).toBe('bg-blue-100 text-blue-800');
      expect(getGenderBadgeClass('COLT')).toBe('bg-blue-100 text-blue-800');
      expect(getGenderBadgeClass('MARE')).toBe('bg-pink-100 text-pink-800');
      expect(getGenderBadgeClass('FILLY')).toBe('bg-pink-100 text-pink-800');
      expect(getGenderBadgeClass('GELDING')).toBe('bg-gray-100 text-gray-800');
    });

    it('should return default class for unknown input', () => {
      expect(getGenderBadgeClass('UNKNOWN')).toBe('bg-gray-100 text-gray-800');
    });
  });

  describe('getDisplayGender', () => {
    it('should return correct labels for Japanese input', () => {
      expect(getDisplayGender('牡')).toBe('牡');
      expect(getDisplayGender('牝')).toBe('牝');
      expect(getDisplayGender('セン')).toBe('セ');
    });

    it('should map Raw Enum values to Japanese labels', () => {
      expect(getDisplayGender('HORSE')).toBe('牡');
      expect(getDisplayGender('COLT')).toBe('牡');
      expect(getDisplayGender('MARE')).toBe('牝');
      expect(getDisplayGender('FILLY')).toBe('牝');
      expect(getDisplayGender('GELDING')).toBe('セ');
    });

    it('should return original value for unknown input', () => {
      expect(getDisplayGender('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('getGenderAge', () => {
    it('should format gender and age correctly', () => {
      expect(getGenderAge('HORSE', 5)).toBe('牡5');
      expect(getGenderAge('MARE', 4)).toBe('牝4');
      expect(getGenderAge('GELDING', 6)).toBe('セ6');
    });

    it('should format only gender if age is null', () => {
      expect(getGenderAge('HORSE', null)).toBe('牡');
      expect(getGenderAge('FILLY', null)).toBe('牝');
    });
  });
});
