'use client';

import { cn } from '@/shared/utils/cn';
import { Home, Trophy, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'ホーム', href: '/mypage', icon: Home },
  { label: 'レース', href: '/races', icon: Trophy },
  { label: 'マイページ', href: '/profile', icon: UserIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="pb-safe fixed bottom-0 left-0 z-50 w-full border-t border-gray-200 bg-white pt-2 backdrop-blur-lg md:hidden">
      <div className="grid h-14 grid-cols-3 items-center justify-items-center">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-900'
              )}
            >
              <Icon className={cn('h-6 w-6', isActive ? 'stroke-[2.5px]' : 'stroke-2')} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
