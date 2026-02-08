'use client';

import { Dialog, DialogContent } from '@/shared/ui/dialog';
import { useRouter } from 'next/navigation';

export function InterceptDialog({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.back();
    }
  };

  return (
    <Dialog defaultOpen onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">{children}</DialogContent>
    </Dialog>
  );
}
