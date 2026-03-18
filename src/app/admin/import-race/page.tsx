import { ImportRaceClient } from '@/features/admin/import-race/ui/import-race-client';
import { getEvents } from '@/features/admin/manage-races/actions/read';
import { getVenues } from '@/features/admin/manage-venues/actions';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '出馬表インポート',
};

export default async function ImportRacePage() {
  const [events, venues] = await Promise.all([getEvents(), getVenues()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">出馬表インポート</h1>
        <p className="mt-1 text-sm text-gray-500">Netkeiba出馬表URLからレース・出走馬情報を一括インポートします</p>
      </div>
      <ImportRaceClient events={events} venues={venues} />
    </div>
  );
}
