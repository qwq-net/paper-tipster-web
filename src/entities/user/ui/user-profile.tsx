import { Role, RoleColor, RoleLabel } from '@/entities/user';
import type { Session } from 'next-auth';
import Image from 'next/image';

interface UserProfileProps {
  user: Session['user'];
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="flex items-center gap-3">
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name || 'User Avatar'}
          width={48}
          height={48}
          className="rounded-full border border-gray-100 shadow-sm"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
          <span className="text-lg font-bold text-gray-400">?</span>
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-lg leading-tight font-bold text-gray-900">{user.name || 'Unknown Racer'}</span>
        <span
          className={`mt-0.5 w-fit rounded border px-1.5 py-0.5 text-sm font-medium ${RoleColor[user.role as Role]}`}
        >
          {RoleLabel[user.role as Role]}
        </span>
      </div>
    </div>
  );
}
