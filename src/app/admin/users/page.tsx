import { UserRoleSelect } from '@/features/admin/manage-users';
import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { users } from '@/shared/db/schema';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const allUsers = await db.select().from(users).orderBy(users.createdAt);

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 p-8 text-black">
      <div className="w-full max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">User Management</h1>
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="p-4 font-semibold text-gray-600">User</th>
                <th className="p-4 font-semibold text-gray-600">ID</th>
                <th className="p-4 font-semibold text-gray-600">Role</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user) => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="flex items-center gap-3 p-4">
                    {user.image && (
                      <Image src={user.image} alt="User Icon" width={32} height={32} className="rounded-full" />
                    )}
                    <span className="font-medium">{user.name || 'No Name'}</span>
                  </td>
                  <td className="space-x-2 p-4">
                    <code className="rounded bg-gray-100 p-1 text-xs text-gray-500">{user.id}</code>
                    {user.id === session.user.id && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">YOU</span>
                    )}
                  </td>
                  <td className="p-4">
                    <UserRoleSelect userId={user.id} currentRole={user.role as 'USER' | 'ADMIN'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
