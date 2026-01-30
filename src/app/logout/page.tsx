import { LogoutButton } from "@/features/auth";

export default function LogoutPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white gap-4">
      <h1 className="text-xl font-bold">Sign Out</h1>
      <p className="text-gray-600">Are you sure you want to sign out?</p>
      <LogoutButton />
    </div>
  );
}
