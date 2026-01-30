import type { Session } from "next-auth";

interface UserProfileProps {
  user: Session["user"];
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">My Page</h1>
      <p className="text-lg">
        User ID:{" "}
        <span className="font-mono bg-gray-100 p-1 rounded">{user.id}</span>
      </p>
      <p className="text-sm text-gray-500 mt-2">Role: {user.role}</p>
    </div>
  );
}
