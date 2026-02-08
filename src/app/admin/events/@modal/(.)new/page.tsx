'use client';

import { EventForm } from '@/features/admin/manage-events/ui/event-form';
import { InterceptDialog } from '@/shared/ui/intercept-dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useRouter } from 'next/navigation';

export default function InterceptCreateEventPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.back();
  };

  return (
    <InterceptDialog>
      <div className="mb-4">
        <DialogTitle className="text-xl font-semibold text-gray-900">新規イベント作成</DialogTitle>
        <p className="mt-1 text-sm text-gray-500">新しいイベントの基本情報を入力してください。</p>
      </div>
      <EventForm onSuccess={handleSuccess} />
    </InterceptDialog>
  );
}
