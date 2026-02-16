export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  GUEST: 'GUEST',
  TIPSTER: 'TIPSTER',
  AI_TIPSTER: 'AI_TIPSTER',
  AI_USER: 'AI_USER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.USER]: '一般ユーザー',
  [ROLES.ADMIN]: '管理者',
  [ROLES.GUEST]: 'ゲスト',
  [ROLES.TIPSTER]: '予想家',
  [ROLES.AI_TIPSTER]: 'AI予想家',
  [ROLES.AI_USER]: 'AIユーザー',
};
