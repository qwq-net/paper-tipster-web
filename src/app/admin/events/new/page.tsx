'use client';

import { EventForm } from '@/features/admin/manage-events/ui/event-form';
import { Card } from '@/shared/ui';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateEventPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/admin/events');
  };

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
        <h1 className="text-2xl font-semibold text-gray-900">新規イベント作成</h1>
        <p className="mt-1 text-sm text-gray-500">新しいイベントの基本情報を入力してください</p>
      </div>

      <Card className="p-6">
        <EventForm onSuccess={handleSuccess} />
      </Card>
    </div>
  );
}
