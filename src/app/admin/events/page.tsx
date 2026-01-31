import { CreateEventForm, EventList } from '@/features/admin/manage-events';
import { Card } from '@/shared/ui';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { events } from '@/shared/db/schema';
import { desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function AdminEventsPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  const allEvents = await db.query.events.findMany({
    orderBy: [desc(events.createdAt)],
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-secondary text-3xl font-bold">Event Management</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="border-none bg-transparent p-0 shadow-none hover:shadow-none lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-secondary mb-4 text-xl font-bold">All Events</h2>
            <EventList events={allEvents} />
          </div>
        </Card>

        <Card className="h-fit">
          <div className="p-6">
            <h2 className="text-secondary mb-4 text-xl font-bold">Create New Event</h2>
            <CreateEventForm />
          </div>
        </Card>
      </div>
    </div>
  );
}
