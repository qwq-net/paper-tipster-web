'use client';

import { getRaceDefinitions } from '@/features/admin/manage-race-definitions/actions';
import { getEvents, getRaceById } from '@/features/admin/manage-races';
import { RaceForm } from '@/features/admin/manage-races/ui/race-form';
import { getVenues } from '@/features/admin/manage-venues/actions';
import { InterceptDialog } from '@/shared/ui/intercept-dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function InterceptEditRacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<{
    race: Awaited<ReturnType<typeof getRaceById>>;
    events: Awaited<ReturnType<typeof getEvents>>;
    raceDefinitions: Awaited<ReturnType<typeof getRaceDefinitions>>;
    venues: Awaited<ReturnType<typeof getVenues>>;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [race, events, raceDefinitions, venues] = await Promise.all([
        getRaceById(id),
        getEvents(),
        getRaceDefinitions(),
        getVenues(),
      ]);
      setData({ race, events, raceDefinitions, venues });
    };
    fetchData();
  }, [id]);

  const handleSuccess = () => {
    router.back();
    router.refresh();
  };

  if (!data || !data.race) return null;

  return (
    <InterceptDialog>
      <div className="mb-4">
        <DialogTitle className="text-xl font-semibold text-gray-900">レース情報の編集</DialogTitle>
        <p className="mt-1 text-sm text-gray-500">レース情報を編集します。</p>
      </div>
      <RaceForm
        initialData={{
          ...data.race,
          raceNumber: data.race.raceNumber,
          condition: data.race.condition as '良' | '稍重' | '重' | '不良' | null,
          surface: data.race.surface as '芝' | 'ダート',
          closingAt: data.race.closingAt,
          venueId: data.race.venueId || undefined,
          direction: data.race.direction || undefined,
        }}
        events={data.events}
        raceDefinitions={data.raceDefinitions}
        venues={data.venues}
        showClosingAt={true}
        onSuccess={handleSuccess}
      />
    </InterceptDialog>
  );
}
