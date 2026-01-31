import { auth } from "@/shared/config/auth";
import { db } from "@/shared/db";
import { users } from "@/shared/db/schema";
import { UserRoleSelect } from "@/features/admin/manage-users";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const allUsers = await db.select().from(users).orderBy(users.createdAt);

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-gray-50 text-black">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-4 font-semibold text-gray-600">User</th>
                <th className="p-4 font-semibold text-gray-600">ID</th>
                <th className="p-4 font-semibold text-gray-600">Role</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="p-4 flex items-center gap-3">
                    {user.image && (
                      <Image
                        src={user.image}
                        alt="User Icon"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    )}
                    <span className="font-medium">
                      {user.name || "No Name"}
                    </span>
                  </td>
                  <td className="p-4 space-x-2">
                    <code className="text-xs bg-gray-100 p-1 rounded text-gray-500">
                      {user.id}
                    </code>
                    {user.id === session.user.id && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        YOU
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <UserRoleSelect
                      userId={user.id}
                      currentRole={user.role as "USER" | "ADMIN"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
