'use client';

import { getHorseTags } from '@/features/admin/manage-horse-tags/actions';
import { getHorse } from '@/features/admin/manage-horses/actions';
import { HorseForm } from '@/features/admin/manage-horses/ui/horse-form';
import { DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { InterceptDialog } from '@/shared/ui/intercept-dialog';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function InterceptEditHorsePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<{
    horse: Awaited<ReturnType<typeof getHorse>>;
    tagOptions: Awaited<ReturnType<typeof getHorseTags>>;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [horse, tagOptions] = await Promise.all([getHorse(id), getHorseTags()]);
      setData({ horse, tagOptions });
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
        <DialogTitle>馬情報の編集</DialogTitle>
      </DialogHeader>
      <div className="mt-4">
        <HorseForm
          initialData={{
            ...data.horse,
            gender: data.horse.gender as '牡' | '牝' | 'セン',
            origin: data.horse.origin as 'DOMESTIC' | 'FOREIGN_BRED' | 'FOREIGN_TRAINED',
            type: data.horse.type as 'REAL' | 'FICTIONAL',
            tags: data.horse.tags,
          }}
          tagOptions={data.tagOptions}
          onSuccess={handleSuccess}
        />
      </div>
    </InterceptDialog>
  );
}
