'use client';

import { EventForm } from '@/features/admin/manage-events/ui/event-form';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateEventPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/admin/events');
  };

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
        <h1 className="text-2xl font-semibold text-gray-900">新規イベント作成</h1>
        <p className="mt-1 text-sm text-gray-500">新しいイベントの基本情報を入力してください</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <EventForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
