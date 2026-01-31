import { UserRoleSelect } from '@/features/admin/manage-users';
import { Card } from '@/shared/ui';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { users } from '@/shared/db/schema';
import Image from 'next/image';

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) return null;

  const allUsers = await db.select().from(users).orderBy(users.createdAt);

  return (
    <div className="w-full max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-secondary text-3xl font-bold">User Management</h1>
        <div className="text-sm text-gray-500">Total Users: {allUsers.length}</div>
      </div>

      <Card className="overflow-hidden border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 font-medium tracking-wider uppercase">User</th>
                <th className="px-6 py-3 font-medium tracking-wider uppercase">ID</th>
                <th className="px-6 py-3 font-medium tracking-wider uppercase">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {allUsers.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt="User Icon"
                          width={32}
                          height={32}
                          className="rounded-full shadow-sm ring-1 ring-gray-200"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-xs font-bold text-gray-400">
                          ?
                        </div>
                      )}
                      <span className="font-medium text-gray-900">{user.name || 'No Name'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-500">
                        {user.id.substring(0, 8)}...
                      </code>
                      {user.id === session.user.id && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                          YOU
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <UserRoleSelect userId={user.id} currentRole={user.role as 'USER' | 'ADMIN'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
