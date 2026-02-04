'use server';

import { db } from '@/shared/db';
import { loginAttempts } from '@/shared/db/schema';
import { getClientIp } from '@/shared/utils/get-client-ip';
import { eq } from 'drizzle-orm';

export async function checkUserLockStatus(username: string) {
  if (!username) return { isLocked: false };

  const attempt = await db.query.loginAttempts.findFirst({
    where: eq(loginAttempts.identifier, username),
  });

  const now = new Date();
  if (attempt?.lockedUntil && attempt.lockedUntil > now) {
    const diff = attempt.lockedUntil.getTime() - now.getTime();
    const minutes = Math.ceil(diff / 60000);
    return {
      isLocked: true,
      lockedUntil: attempt.lockedUntil,
      remainingMinutes: minutes,
    };
  }

  return { isLocked: false };
}

export async function checkIpLockStatus() {
  const ip = await getClientIp();
  const identifier = `IP:${ip}`;

  const attempt = await db.query.loginAttempts.findFirst({
    where: eq(loginAttempts.identifier, identifier),
  });

  const now = new Date();
  if (attempt?.lockedUntil && attempt.lockedUntil > now) {
    const diff = attempt.lockedUntil.getTime() - now.getTime();
    const minutes = Math.ceil(diff / 60000);
    return {
      isLocked: true,
      lockedUntil: attempt.lockedUntil,
      remainingMinutes: minutes,
    };
  }

  return { isLocked: false };
}
