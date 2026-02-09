'use client';

import { VenueForm } from '@/features/admin/manage-venues/ui/venue-form';
import { DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { InterceptDialog } from '@/shared/ui/intercept-dialog';
import { useRouter } from 'next/navigation';

export default function InterceptCreateVenuePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.back();
  };

  return (
    <InterceptDialog>
      <DialogHeader>
        <DialogTitle>新規会場登録</DialogTitle>
      </DialogHeader>
      <div className="mt-4">
        <VenueForm onSuccess={handleSuccess} />
      </div>
    </InterceptDialog>
  );
}
