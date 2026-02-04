import { AdminSidebar } from '@/features/admin/ui/admin-sidebar';
import { auth } from '@/shared/config/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar user={session.user} />
      <main className="flex-1 overflow-y-auto p-6 pt-16 sm:p-8 md:pt-8 md:pl-72">{children}</main>
    </div>
  );
}
