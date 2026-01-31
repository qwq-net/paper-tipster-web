import type { Session } from 'next-auth';
import Image from 'next/image';

interface UserProfileProps {
  user: Session['user'];
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4 px-4">
      <h1 className="text-2xl font-bold">My Page</h1>

      <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-500">User Object (Debug)</h2>
        <pre className="font-mono text-xs whitespace-pre-wrap">{JSON.stringify(user, null, 2)}</pre>
      </div>

      {user.image && (
        <Image
          src={user.image}
          alt="User Avatar"
          width={80}
          height={80}
          className="rounded-full border-2 border-gray-300"
        />
      )}
    </div>
  );
}
