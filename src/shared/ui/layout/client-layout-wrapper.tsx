'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from './bottom-nav';
import { Header } from './header';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <div className="flex min-h-screen flex-col">
      {!isLoginPage && <Header />}
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      {!isLoginPage && <BottomNav />}
    </div>
  );
}
