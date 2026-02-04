'use client';

import { Role } from '@/entities/user';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
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
  currentUserId: string;
}

type TabType = 'ALL_USERS' | 'GUEST' | 'AI';

export function UserList({ users, currentUserId }: UserListProps) {
  const [activeTab, setActiveTab] = useState<TabType>('ALL_USERS');

  const filteredUsers = users.filter((user) => {
    if (activeTab === 'GUEST') return user.role === 'GUEST';
    if (activeTab === 'AI') return user.role === 'AI_USER' || user.role === 'AI_TIPSTER';
    return !['GUEST', 'AI_USER', 'AI_TIPSTER'].includes(user.role);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab('ALL_USERS')}
            className={clsx(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              activeTab === 'ALL_USERS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            )}
          >
            ユーザー
          </button>
          <button
            onClick={() => setActiveTab('GUEST')}
            className={clsx(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              activeTab === 'GUEST' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            )}
          >
            ゲスト
          </button>
          <button
            onClick={() => setActiveTab('AI')}
            className={clsx(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              activeTab === 'AI' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            )}
          >
            AI
          </button>
        </div>

        <Link
          href="/admin/users/guests"
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
        >
          ゲストコード管理
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full min-w-[800px] border-collapse text-left text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4 font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">User</th>
              <th className="px-6 py-4 font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">ID</th>
              <th className="px-6 py-4 font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">Role</th>
              <th className="px-6 py-4 font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">Status</th>
              <th className="px-6 py-4 font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No users found in this category.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
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
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-sm font-semibold text-gray-400">
                          ?
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{user.name || 'No Name'}</div>
                        <div className="text-sm text-gray-400">{user.accounts[0]?.provider || 'credential'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-500">
                        {user.id.substring(0, 8)}...
                      </code>
                      {user.id === currentUserId && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-sm text-blue-700">You</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <UserRoleSelect userId={user.id} currentRole={user.role} />
                  </td>
                  <td className="px-6 py-4">
                    {user.disabledAt ? (
                      <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-sm font-medium text-red-700 ring-1 ring-red-600/10 ring-inset">
                        Disabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <UserActionsMenu
                      userId={user.id}
                      isDisabled={!!user.disabledAt}
                      isCurrentUser={user.id === currentUserId}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
