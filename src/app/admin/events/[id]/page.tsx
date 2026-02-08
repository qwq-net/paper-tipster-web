import { getEvent } from '@/features/admin/manage-events/actions';
import { AdminEventEditor } from '@/features/admin/manage-events/ui/admin-event-editor';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EventEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/events"
          className="mb-4 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          イベント一覧に戻る
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">イベント情報の編集</h1>
        <p className="mt-1 text-sm text-gray-500">{event.name} の設定を変更します</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <AdminEventEditor event={event} />
      </div>
    </div>
  );
}
