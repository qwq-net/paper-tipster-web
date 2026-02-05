'use client';

import { usePathname } from 'next/navigation';

import { Header } from './header';

import { Footer } from './footer';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showLayout = !pathname.startsWith('/admin');

  return (
    <div className="flex min-h-screen flex-col">
      {showLayout && <Header />}
      <main className="flex flex-1 flex-col">{children}</main>
      {showLayout && <Footer />}
    </div>
  );
}
