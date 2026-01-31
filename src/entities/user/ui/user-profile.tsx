import type { Session } from "next-auth";

interface UserProfileProps {
  user: Session["user"];
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl px-4">
      <h1 className="text-2xl font-bold">My Page</h1>

      <div className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200 overflow-x-auto">
        <h2 className="text-sm font-semibold text-gray-500 mb-2">
          User Object (Debug)
        </h2>
        <pre className="text-xs font-mono whitespace-pre-wrap">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      {user.image && (
        <img
          src={user.image}
          alt="User Avatar"
          className="w-20 h-20 rounded-full border-2 border-gray-300"
        />
      )}
    </div>
  );
}
