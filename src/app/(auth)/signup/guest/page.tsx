import { GuestSignupClient } from '@/features/auth/ui/guest-signup-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '招待コード新規登録',
};

export default function GuestSignupPage() {
  return <GuestSignupClient />;
}
