"use client";

import { useTransition } from "react";
import { updateUserRole } from "../actions";

interface UserRoleSelectProps {
  userId: string;
  currentRole: "USER" | "ADMIN";
}

export function UserRoleSelect({ userId, currentRole }: UserRoleSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as "USER" | "ADMIN";
    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole);
      } catch (error) {
        alert("Failed to update role");
        console.error(error);
      }
    });
  };

  return (
    <select
      value={currentRole}
      onChange={handleChange}
      disabled={isPending}
      className={`border rounded px-2 py-1 text-sm ${
        currentRole === "ADMIN"
          ? "bg-red-50 text-red-700 border-red-200"
          : "bg-white"
      }`}
    >
      <option value="USER">USER</option>
      <option value="ADMIN">ADMIN</option>
    </select>
  );
}
