import { ROLES } from '@/entities/user/constants';
import { describe, expect, it } from 'vitest';
import { canManageForecasts, isAdmin, isTipster } from './auth-helpers';

describe('utils/auth-helpers', () => {
  describe('isAdmin', () => {
    it('ADMINロールに対してtrueを返すこと', () => {
      expect(isAdmin({ role: ROLES.ADMIN })).toBe(true);
    });

    it('その他のロールやnullに対してfalseを返すこと', () => {
      expect(isAdmin({ role: ROLES.TIPSTER })).toBe(false);
      expect(isAdmin(null)).toBe(false);
    });
  });

  describe('isTipster', () => {
    it('TIPSTERロールに対してtrueを返すこと', () => {
      expect(isTipster({ role: ROLES.TIPSTER })).toBe(true);
    });
  });

  describe('canManageForecasts', () => {
    it('ADMINまたはTIPSTERに対してtrueを返すこと', () => {
      expect(canManageForecasts({ role: ROLES.ADMIN })).toBe(true);
      expect(canManageForecasts({ role: ROLES.TIPSTER })).toBe(true);
      expect(canManageForecasts({ role: ROLES.USER })).toBe(false);
    });
  });
});
