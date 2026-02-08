import { getEvent } from '@/features/admin/manage-events/actions';
import { AdminEventEditor } from '@/features/admin/manage-events/ui/admin-event-editor';
import { InterceptDialog } from '@/shared/ui/intercept-dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import { notFound } from 'next/navigation';

export default async function InterceptEventEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  return (
    <InterceptDialog>
      <div className="mb-4">
        <DialogTitle className="text-xl font-semibold text-gray-900">イベント情報の編集</DialogTitle>
      </div>
      <AdminEventEditor event={event} />
    </InterceptDialog>
  );
}
