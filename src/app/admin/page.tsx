import { Card, CardContent, CardHeader } from '@/shared/ui';
import { ArrowRight, Calendar, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export default async function AdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-secondary text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-500">Welcome back, Administrator. Here is what&apos;s happening today.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="border-l-primary border-l-4">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <h3 className="text-secondary mt-1 text-2xl font-bold">--</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-accent border-l-4">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Events</p>
                <h3 className="text-secondary mt-1 text-2xl font-bold">--</h3>
              </div>
              <div className="text-accent flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <h3 className="text-secondary mt-1 text-2xl font-bold">¥ --</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-secondary text-xl font-bold">Quick Actions</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link
              href="/admin/events"
              className="group flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-all hover:border-gray-200 hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary group-hover:bg-primary flex h-10 w-10 items-center justify-center rounded-lg transition-colors group-hover:text-white">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-secondary font-bold">Manage Events</h4>
                  <p className="text-xs text-gray-500">Create, edit, or settle racing events</p>
                </div>
              </div>
              <ArrowRight className="group-hover:text-primary h-5 w-5 text-gray-300 transition-colors" />
            </Link>

            <Link
              href="/admin/users"
              className="group flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-all hover:border-gray-200 hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-secondary font-bold">Manage Users</h4>
                  <p className="text-xs text-gray-500">View users and update roles</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-blue-600" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
