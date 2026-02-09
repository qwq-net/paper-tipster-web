import { GuestLoginClient } from '@/features/auth/ui/guest-login-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '招待コードログイン',
};

export default function GuestLoginPage() {
  return <GuestLoginClient />;
}
