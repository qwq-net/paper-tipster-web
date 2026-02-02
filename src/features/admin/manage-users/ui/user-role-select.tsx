'use client';

import { Role, RoleColor, RoleLabel } from '@/entities/user';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { updateUserRole } from '../actions';

interface UserRoleSelectProps {
  userId: string;
  currentRole: Role;
}

export function UserRoleSelect({ userId, currentRole }: UserRoleSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role;
    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole);
        toast.success('役割を変更しました');
      } catch (error) {
        toast.error('役割の変更に失敗しました');
        console.error(error);
      }
    });
  };

  return (
    <select
      value={currentRole}
      onChange={handleChange}
      disabled={
        isPending || currentRole === Role.AI_USER || currentRole === Role.AI_TIPSTER || currentRole === Role.GUEST
      }
      className={`w-32 rounded border px-2 py-1 text-sm ${RoleColor[currentRole]} ${
        currentRole === Role.AI_USER || currentRole === Role.AI_TIPSTER || currentRole === Role.GUEST
          ? 'cursor-not-allowed appearance-none opacity-80'
          : ''
      }`}
    >
      {Object.values(Role)
        .filter((role) =>
          currentRole === Role.AI_USER || currentRole === Role.AI_TIPSTER || currentRole === Role.GUEST
            ? role === currentRole
            : role !== Role.AI_USER && role !== Role.AI_TIPSTER && role !== Role.GUEST
        )
        .map((role) => (
          <option key={role} value={role}>
            {RoleLabel[role]}
          </option>
        ))}
    </select>
  );
}
