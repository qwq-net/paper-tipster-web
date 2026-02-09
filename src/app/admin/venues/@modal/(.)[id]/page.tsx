'use client';

import { getVenue } from '@/features/admin/manage-venues/actions';
import { VenueForm } from '@/features/admin/manage-venues/ui/venue-form';
import { DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { InterceptDialog } from '@/shared/ui/intercept-dialog';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function InterceptEditVenuePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [venue, setVenue] = useState<Awaited<ReturnType<typeof getVenue>> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getVenue(id);
      setVenue(data);
    };
    fetchData();
  }, [id]);

  const handleSuccess = () => {
    router.back();
  };

  if (!venue) {
    return null;
  }

  return (
    <InterceptDialog>
      <DialogHeader>
        <DialogTitle>会場情報の編集</DialogTitle>
      </DialogHeader>
      <div className="mt-4">
        <VenueForm
          initialData={{
            ...venue,
            code: venue.code || undefined,
            direction: venue.defaultDirection as 'LEFT' | 'RIGHT' | 'STRAIGHT',
            area: venue.area as 'EAST_JAPAN' | 'WEST_JAPAN' | 'OVERSEAS',
          }}
          onSuccess={handleSuccess}
        />
      </div>
    </InterceptDialog>
  );
}
