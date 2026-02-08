'use client';

import { getHorseTags } from '@/features/admin/manage-horse-tags/actions';
import { HorseForm } from '@/features/admin/manage-horses/ui/horse-form';
import { DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { InterceptDialog } from '@/shared/ui/intercept-dialog';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function InterceptCreateHorsePage() {
  const router = useRouter();
  const [tagOptions, setTagOptions] = useState<Awaited<ReturnType<typeof getHorseTags>>>([]);

  useEffect(() => {
    const fetchData = async () => {
      const tags = await getHorseTags();
      setTagOptions(tags);
    };
    fetchData();
  }, []);

  const handleSuccess = () => {
    router.back();
  };

  return (
    <InterceptDialog>
      <DialogHeader>
        <DialogTitle>新規馬登録</DialogTitle>
      </DialogHeader>
      <div className="mt-4">
        <HorseForm tagOptions={tagOptions} onSuccess={handleSuccess} />
      </div>
    </InterceptDialog>
  );
}
