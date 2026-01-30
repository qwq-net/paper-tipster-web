import { auth } from "@/shared/config/auth";
import { UserProfile } from "@/entities/user";
import { redirect } from "next/navigation";

export default async function MyPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      <UserProfile user={session.user} />
    </div>
  );
}
