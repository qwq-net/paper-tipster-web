'use client';

import { cn } from '@/shared/utils/cn';
import Link from 'next/link';

interface GuestAuthTabsProps {
  activeTab: 'signup' | 'login';
}

export function GuestAuthTabs({ activeTab }: GuestAuthTabsProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1.5">
      <Link
        href="/signup/guest"
        className={cn(
          'flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-bold transition-all',
          activeTab === 'signup'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'bg-transparent text-gray-500 hover:bg-gray-200/50 hover:text-gray-700'
        )}
      >
        新規登録
      </Link>
      <Link
        href="/login/guest"
        className={cn(
          'flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-bold transition-all',
          activeTab === 'login'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'bg-transparent text-gray-500 hover:bg-gray-200/50 hover:text-gray-700'
        )}
      >
        ログイン
      </Link>
    </div>
  );
}
