import { ClientLayoutWrapper } from '@/shared/ui/layout/client-layout-wrapper';
import type { Metadata } from 'next';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';
import './styles/globals.css';

import { siteConfig } from '@/shared/config/site';

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <NextTopLoader color="#3b82f6" showSpinner={false} shadow="0 0 10px #3b82f6,0 0 5px #3b82f6" />
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
