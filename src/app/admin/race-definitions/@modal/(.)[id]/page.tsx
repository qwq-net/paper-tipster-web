'use client';

import { getRaceDefinition } from '@/features/admin/manage-race-definitions/actions';
import { RaceDefinitionForm } from '@/features/admin/manage-race-definitions/ui/race-definition-form';
import { getVenues } from '@/features/admin/manage-venues/actions';
import { DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { InterceptDialog } from '@/shared/ui/intercept-dialog';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function InterceptEditRaceDefinitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<{
    raceDefinition: Awaited<ReturnType<typeof getRaceDefinition>>;
    venues: Awaited<ReturnType<typeof getVenues>>;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [raceDefinition, venues] = await Promise.all([getRaceDefinition(id), getVenues()]);
      setData({ raceDefinition, venues });
    };
    fetchData();
  }, [id]);

  const handleSuccess = () => {
    router.back();
  };

  if (!data) return null;

  return (
    <InterceptDialog>
      <DialogHeader>
        <DialogTitle>レース定義の編集</DialogTitle>
      </DialogHeader>
      <div className="mt-4">
        <RaceDefinitionForm
          initialData={{
            ...data.raceDefinition,
            code: data.raceDefinition.code || undefined,
            defaultVenueId: data.raceDefinition.defaultVenueId,
            defaultSurface: data.raceDefinition.defaultSurface,
          }}
          venues={data.venues}
          onSuccess={handleSuccess}
        />
      </div>
    </InterceptDialog>
  );
}
