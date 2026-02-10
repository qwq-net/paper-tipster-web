import { auth } from '@/shared/config/auth';
import { revalidatePath } from 'next/cache';

export const ADMIN_ERRORS = {
  UNAUTHORIZED: '認証されていません',
  NOT_FOUND: 'データが見つかりません',
  INVALID_INPUT: '入力内容が無効です',
  RACE_CLOSED: 'このレースの受付は終了しています',
  DEADLINE_EXCEEDED: 'このレースは締切時刻を過ぎています',
  INSUFFICIENT_BALANCE: '残高が不足しています',
  INVALID_WALLET: '不正なウォレットです',
  INVALID_AMOUNT: '金額が無効です',
} as const;

export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error(ADMIN_ERRORS.UNAUTHORIZED);
  }
  return session;
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error(ADMIN_ERRORS.UNAUTHORIZED);
  }
  return session;
}

export function revalidateRacePaths(raceId: string) {
  revalidatePath('/admin/races');
  revalidatePath(`/admin/races/${raceId}`);
  revalidatePath(`/races/${raceId}`);
  revalidatePath(`/races/${raceId}/standby`);
  revalidatePath('/mypage');
}
