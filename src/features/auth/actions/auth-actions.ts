'use server';

import { signIn, signOut } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { guestCodes, users } from '@/shared/db/schema';
import { redis } from '@/shared/lib/redis';
import { getClientIp } from '@/shared/utils/get-client-ip';
import { eq } from 'drizzle-orm';

export async function discordSignIn() {
  await signIn('discord', { redirectTo: '/mypage' });
}

export async function checkIpLockStatus() {
  const ip = await getClientIp();
  const identifier = `ratelimit:ip:${ip}`;

  const data = await redis.get(identifier);
  const attempt = data ? JSON.parse(data) : null;

  const now = new Date();
  if (attempt?.lockedUntil && attempt.lockedUntil > now.getTime()) {
    const diff = attempt.lockedUntil - now.getTime();
    const minutes = Math.ceil(diff / 60000);
    return {
      isLocked: true,
      lockedUntil: new Date(attempt.lockedUntil),
      remainingMinutes: minutes,
    };
  }

  return { isLocked: false };
}

export async function validateGuestRegistration(code: string, username: string) {
  const ipLock = await checkIpLockStatus();
  if (ipLock.isLocked) return { error: 'RateLimitExceeded', remainingMinutes: ipLock.remainingMinutes };

  const guestCode = await db.query.guestCodes.findFirst({
    where: eq(guestCodes.code, code),
  });

  if (!guestCode || guestCode.disabledAt) {
    return { error: 'InvalidGuestCode' };
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.name, username),
  });

  if (existingUser) {
    return { error: 'UsernameTaken' };
  }

  return { success: true };
}

export async function logout() {
  await signOut({ redirectTo: '/login' });
}
