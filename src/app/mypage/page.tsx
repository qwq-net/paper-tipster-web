import { auth } from "@/shared/config/auth";
import { UserProfile } from "@/entities/user";
import { LogoutButton } from "@/features/auth";
import { redirect } from "next/navigation";

export default async function MyPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 gap-6">
      <UserProfile user={session.user} />

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {session.user.role === "ADMIN" && (
          <a
            href="/admin"
            className="w-full text-center py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 font-bold transition-colors"
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
