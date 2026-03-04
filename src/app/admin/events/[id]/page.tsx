import { getEvent } from '@/features/admin/manage-events/actions';
import { AdminEventEditor } from '@/features/admin/manage-events/ui/admin-event-editor';
import { Card } from '@/shared/ui';
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
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/events"
          className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft size={16} />
          一覧へ戻る
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">イベント情報の編集</h1>
        <p className="mt-1 text-sm text-gray-500">{event.name} の設定を変更します</p>
      </div>

      <Card className="p-6">
        <AdminEventEditor event={event} />
      </Card>
    </div>
  );
}
