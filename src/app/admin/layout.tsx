import { LogoutButton } from '@/features/auth/ui/logout-button';
import { auth } from '@/shared/config/auth';
import { Calendar, LayoutDashboard, Users } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Events', href: '/admin/events', icon: Calendar },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="bg-secondary flex w-64 flex-col border-r border-gray-800 text-white">
        <div className="border-b border-gray-800 p-6">
          <div className="text-primary flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            <h1 className="text-xl font-bold tracking-tight text-white">JRRA Admin</h1>
          </div>
          <p className="mt-2 text-[10px] font-medium tracking-wider text-gray-400 uppercase">
            Japan Ranranru Racing Association
          </p>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Icon className="h-5 w-5 opacity-70" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-800 bg-black/20 p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary/20 text-primary border-primary/30 flex h-8 w-8 items-center justify-center rounded-full border">
              <span className="text-xs font-bold">{session.user.name?.[0] || 'A'}</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm leading-none font-bold text-white">{session.user.name}</span>
              <span className="mt-1 text-[10px] text-gray-400">Administrator</span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
