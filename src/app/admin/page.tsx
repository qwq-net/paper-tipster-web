import { Card, CardContent, CardHeader } from '@/shared/ui';
import { ArrowRight, Calendar, Carrot, ClipboardList, TrendingUp, Trophy, Users } from 'lucide-react';
import Link from 'next/link';

export default async function AdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-secondary text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="flex flex-wrap gap-4">
        <Card className="border-l-primary border-l-4">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Total Users</p>
              <h3 className="text-secondary text-lg font-bold">--</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-accent border-l-4">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="text-accent flex h-9 w-9 items-center justify-center rounded-full bg-orange-50">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Active Events</p>
              <h3 className="text-secondary text-lg font-bold">--</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-600">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Total Revenue</p>
              <h3 className="text-secondary text-lg font-bold">¥ --</h3>
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

            <Link
              href="/admin/horses"
              className="group flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-all hover:border-gray-200 hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                  <Carrot className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-secondary font-bold">Manage Horses</h4>
                  <p className="text-xs text-gray-500">Register and manage horses</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-amber-600" />
            </Link>

            <Link
              href="/admin/races"
              className="group flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-all hover:border-gray-200 hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-secondary font-bold">Manage Races</h4>
                  <p className="text-xs text-gray-500">Create and manage race schedules</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-purple-600" />
            </Link>

            <Link
              href="/admin/entries"
              className="group flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-all hover:border-gray-200 hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-secondary font-bold">Manage Entries</h4>
                  <p className="text-xs text-gray-500">Register horses to races</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-green-600" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
