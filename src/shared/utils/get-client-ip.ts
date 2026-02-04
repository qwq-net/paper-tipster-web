import { headers } from 'next/headers';

export async function getClientIp(): Promise<string> {
  const headersList = await headers();

  const realIp = headersList.get('x-real-ip');
  if (realIp) return realIp.trim();

  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    const ips = forwardedFor.split(',');
    return ips[0].trim();
  }

  return '127.0.0.1';
}
