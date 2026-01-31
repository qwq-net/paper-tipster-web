import { UserList, getUsers } from '@/features/admin/manage-users';
import { auth } from '@/shared/config/auth';
import { Card } from '@/shared/ui';
import { redirect } from 'next/navigation';

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  const allUsers = await getUsers();

  return (
    <div className="w-full max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-secondary text-3xl font-bold">User Management</h1>
        <div className="text-sm text-gray-500">Total Users: {allUsers.length}</div>
      </div>

      <Card className="overflow-hidden border border-gray-200 shadow-sm">
        <UserList users={allUsers} />
      </Card>
    </div>
  );
}
