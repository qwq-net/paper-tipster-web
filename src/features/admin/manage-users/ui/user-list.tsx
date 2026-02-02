import { Role } from '@/entities/user';
import { auth } from '@/shared/config/auth';
import clsx from 'clsx';
import Image from 'next/image';
import { UserActionsMenu } from './user-actions-menu';
import { UserRoleSelect } from './user-role-select';

interface User {
  id: string;
  name: string | null;
  image: string | null;
  role: Role;
  disabledAt: Date | null;
  createdAt: Date;
  accounts: {
    provider: string;
  }[];
}

interface UserListProps {
  users: User[];
}

export async function UserList({ users }: UserListProps) {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-400">
          <tr className="border-b border-gray-200">
            <th className="px-6 py-3 font-medium tracking-wider uppercase">User</th>
            <th className="px-6 py-3 font-medium tracking-wider uppercase">ID</th>
            <th className="px-6 py-3 font-medium tracking-wider uppercase">登録元</th>
            <th className="px-6 py-3 font-medium tracking-wider uppercase">役割</th>
            <th className="px-6 py-3 font-medium tracking-wider uppercase">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {users.map((user) => (
            <tr
              key={user.id}
              className={clsx(
                'transition-colors hover:bg-gray-50/50',
                user.disabledAt && 'bg-red-50 text-gray-500 hover:bg-red-100/50'
              )}
            >
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
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-sm font-bold text-gray-400">
                      ?
                    </div>
                  )}
                  <span className="font-medium text-gray-900">{user.name || 'No Name'}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-500">
                    {user.id.substring(0, 8)}...
                  </code>
                  {user.id === session.user.id && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-sm text-blue-700">自分</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-sm font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">
                  {user.accounts[0]?.provider
                    ? user.accounts[0].provider.charAt(0).toUpperCase() + user.accounts[0].provider.slice(1)
                    : 'NONE'}
                </span>
              </td>
              <td className="px-6 py-4">
                <UserRoleSelect userId={user.id} currentRole={user.role} />
              </td>
              <td className="px-6 py-4">
                <UserActionsMenu
                  userId={user.id}
                  isDisabled={!!user.disabledAt}
                  isCurrentUser={user.id === session.user.id}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
