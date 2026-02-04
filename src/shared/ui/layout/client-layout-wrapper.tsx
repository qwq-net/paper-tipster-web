'use client';

import { usePathname } from 'next/navigation';

import { Header } from './header';

import { Footer } from './footer';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  // Header and Footer should be visible on all pages except Admin pages
  const showHeaderFooter = !isAdminPage;

  return (
    <div className="flex min-h-screen flex-col">
      {showHeaderFooter && <Header />}
      <main className="flex flex-1 flex-col">{children}</main>
      {showHeaderFooter && <Footer />}
    </div>
  );
}
