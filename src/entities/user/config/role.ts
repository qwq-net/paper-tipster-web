export const Role = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  GUEST: 'GUEST',
  TIPSTER: 'TIPSTER',
  AI_TIPSTER: 'AI_TIPSTER',
  AI_USER: 'AI_USER',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const RoleLabel: Record<Role, string> = {
  [Role.ADMIN]: '管理者',
  [Role.USER]: '一般ユーザー',
  [Role.GUEST]: 'ゲストアカウント',
  [Role.TIPSTER]: '予想屋',
  [Role.AI_TIPSTER]: 'AI予想屋',
  [Role.AI_USER]: 'AIユーザー',
};

export const RoleColor: Record<Role, string> = {
  [Role.ADMIN]: 'bg-blue-100 text-blue-700 border-blue-200',
  [Role.USER]: 'bg-green-100 text-green-700 border-green-200',
  [Role.GUEST]: 'bg-gray-100 text-gray-700 border-gray-200',
  [Role.TIPSTER]: 'bg-orange-100 text-orange-700 border-orange-200',
  [Role.AI_TIPSTER]: 'bg-purple-100 text-purple-700 border-purple-200',
  [Role.AI_USER]: 'bg-purple-100 text-purple-700 border-purple-200',
};
