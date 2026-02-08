import { getEventsWithRaces } from '@/features/admin/manage-bets/actions/read';
import { EventAccordion } from '@/features/admin/manage-bets/ui/event-accordion';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '馬券管理',
};

export default async function BetsPage() {
  const events = await getEventsWithRaces();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">馬券管理</h1>
        <p className="mt-1 text-sm text-gray-500">イベント・レース別の馬券購入状況を確認します</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        {events.length === 0 ? (
          <div className="py-12 text-center text-gray-500">登録されているイベントはありません</div>
        ) : (
          <EventAccordion events={events} />
        )}
      </div>
    </div>
  );
}
