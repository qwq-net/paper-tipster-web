import { ROLES } from '@/entities/user/constants';
import { describe, expect, it } from 'vitest';
import { canManageForecasts, isAdmin, isTipster } from './auth-helpers';

describe('utils/auth-helpers', () => {
  describe('isAdmin', () => {
    it('should return true for ADMIN role', () => {
      expect(isAdmin({ role: ROLES.ADMIN })).toBe(true);
    });

    it('should return false for other roles or null', () => {
      expect(isAdmin({ role: ROLES.TIPSTER })).toBe(false);
      expect(isAdmin(null)).toBe(false);
    });
  });

  describe('isTipster', () => {
    it('should return true for TIPSTER role', () => {
      expect(isTipster({ role: ROLES.TIPSTER })).toBe(true);
    });
  });

  describe('canManageForecasts', () => {
    it('should return true for ADMIN or TIPSTER', () => {
      expect(canManageForecasts({ role: ROLES.ADMIN })).toBe(true);
      expect(canManageForecasts({ role: ROLES.TIPSTER })).toBe(true);
      expect(canManageForecasts({ role: ROLES.USER })).toBe(false);
    });
  });
});
