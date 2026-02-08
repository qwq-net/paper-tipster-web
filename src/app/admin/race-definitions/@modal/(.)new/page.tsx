'use client';

import { RaceDefinitionForm } from '@/features/admin/manage-race-definitions/ui/race-definition-form';
import { getVenues } from '@/features/admin/manage-venues/actions';
import { DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { InterceptDialog } from '@/shared/ui/intercept-dialog';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function InterceptCreateRaceDefinitionPage() {
  const router = useRouter();
  const [venues, setVenues] = useState<Awaited<ReturnType<typeof getVenues>>>([]);

  useEffect(() => {
    const fetchData = async () => {
      const venuesData = await getVenues();
      setVenues(venuesData);
    };
    fetchData();
  }, []);

  const handleSuccess = () => {
    router.back();
  };

  return (
    <InterceptDialog>
      <DialogHeader>
        <DialogTitle>レース定義の登録</DialogTitle>
      </DialogHeader>
      <div className="mt-4">
        <RaceDefinitionForm venues={venues} onSuccess={handleSuccess} />
      </div>
    </InterceptDialog>
  );
}
