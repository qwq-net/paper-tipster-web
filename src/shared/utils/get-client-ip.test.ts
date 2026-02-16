import { headers } from 'next/headers';
import { describe, expect, it, vi, type Mock } from 'vitest';
import { getClientIp } from './get-client-ip';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

describe('utils/get-client-ip', () => {
  it('should return x-real-ip if present', async () => {
    (headers as Mock).mockResolvedValue(new Map([['x-real-ip', '1.2.3.4']]));
    const ip = await getClientIp();
    expect(ip).toBe('1.2.3.4');
  });

  it('should return first x-forwarded-for if present', async () => {
    (headers as Mock).mockResolvedValue(new Map([['x-forwarded-for', '5.6.7.8, 9.10.11.12']]));
    const ip = await getClientIp();
    expect(ip).toBe('5.6.7.8');
  });

  it('should fallback to 127.0.0.1 if no headers', async () => {
    (headers as Mock).mockResolvedValue(new Map());
    const ip = await getClientIp();
    expect(ip).toBe('127.0.0.1');
  });
});
