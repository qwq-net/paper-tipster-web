'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from './bottom-nav';
import { Header } from './header';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isAdminPage = pathname.startsWith('/admin');
  const showNavigation = !isLoginPage && !isAdminPage;

  return (
    <div className="flex min-h-screen flex-col">
      {showNavigation && <Header />}
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      {showNavigation && <BottomNav />}
    </div>
  );
}
