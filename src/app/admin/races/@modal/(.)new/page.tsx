'use client';

import { getRaceDefinitions } from '@/features/admin/manage-race-definitions/actions';
import { getEvents } from '@/features/admin/manage-races';
import { RaceForm } from '@/features/admin/manage-races/ui/race-form';
import { getVenues } from '@/features/admin/manage-venues/actions';
import { InterceptDialog } from '@/shared/ui/intercept-dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function InterceptCreateRacePage() {
  const router = useRouter();
  const [data, setData] = useState<{
    events: Awaited<ReturnType<typeof getEvents>>;
    raceDefinitions: Awaited<ReturnType<typeof getRaceDefinitions>>;
    venues: Awaited<ReturnType<typeof getVenues>>;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [events, raceDefinitions, venues] = await Promise.all([getEvents(), getRaceDefinitions(), getVenues()]);
      setData({ events, raceDefinitions, venues });
    };
    fetchData();
  }, []);

  const handleSuccess = () => {
    router.back();
    router.refresh();
  };

  if (!data) return null;

  return (
    <InterceptDialog>
      <div className="mb-4">
        <DialogTitle className="text-xl font-semibold text-gray-900">新規レース登録</DialogTitle>
        <p className="mt-1 text-sm text-gray-500">新しいレースの基本情報を入力してください。</p>
      </div>
      <RaceForm
        events={data.events}
        raceDefinitions={data.raceDefinitions}
        venues={data.venues}
        showClosingAt={false}
        onSuccess={handleSuccess}
      />
    </InterceptDialog>
  );
}
