import { ROLES } from '@/entities/user/constants';

type UserLike =
  | {
      role?: string;
    }
  | null
  | undefined;

export function isAdmin(user: UserLike): boolean {
  return user?.role === ROLES.ADMIN;
}

export function isTipster(user: UserLike): boolean {
  return user?.role === ROLES.TIPSTER;
}

export function canManageForecasts(user: UserLike): boolean {
  return isAdmin(user) || isTipster(user);
}

export function canAccessAdminPanel(user: UserLike): boolean {
  return isAdmin(user) || isTipster(user);
}
