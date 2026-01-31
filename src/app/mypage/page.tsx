import { UserProfile } from '@/entities/user';
import { LogoutButton } from '@/features/auth';
import { auth } from '@/shared/config/auth';
import { redirect } from 'next/navigation';

export default async function MyPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white p-4">
      <UserProfile user={session.user} />

      <div className="flex w-full max-w-xs flex-col gap-3">
        {session.user.role === 'ADMIN' && (
          <a
            href="/admin"
            className="w-full rounded bg-red-600 px-4 py-2 text-center font-bold text-white transition-colors hover:bg-red-700"
          >
            Go to Admin Dashboard
          </a>
        )}

        <div className="flex justify-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
