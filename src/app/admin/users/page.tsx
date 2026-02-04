import { UserList, getUsers } from '@/features/admin/manage-users';
import { auth } from '@/shared/config/auth';
import { redirect } from 'next/navigation';

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  const allUsers = await getUsers();

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">ユーザー管理</h1>
        <div className="text-sm text-gray-500">総ユーザー数: {allUsers.length}</div>
      </div>

      <UserList users={allUsers} currentUserId={session.user.id!} />
    </div>
  );
}
