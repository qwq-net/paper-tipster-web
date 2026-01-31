import { auth } from "@/shared/config/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Admin Dashboard</h1>
      <p className="mb-4">Welcome, Administrator.</p>
      <div className="bg-white p-6 rounded shadow w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Admin Controls</h2>
        <div className="grid grid-cols-1 gap-4">
          <a
            href="/admin/users"
            className="block p-4 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-bold text-lg mb-1">
              User Permission Management
            </h3>
            <p className="text-gray-600 text-sm">
              View all users and update roles.
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
