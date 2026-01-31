import { auth } from '@/shared/config/auth';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 p-8">
      <h1 className="mb-6 text-3xl font-bold text-red-600">Admin Dashboard</h1>
      <p className="mb-4">Welcome, Administrator.</p>
      <div className="w-full max-w-lg rounded bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold">Admin Controls</h2>
        <div className="grid grid-cols-1 gap-4">
          <a
            href="/admin/users"
            className="block rounded border border-gray-200 p-4 transition-colors hover:bg-gray-50"
          >
            <h3 className="mb-1 text-lg font-bold">User Permission Management</h3>
            <p className="text-sm text-gray-600">View all users and update roles.</p>
          </a>
        </div>
      </div>
    </div>
  );
}
