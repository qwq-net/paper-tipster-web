'use client';

import { Button } from '@/shared/ui';
import { cn } from '@/shared/utils/cn';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { updateOddsFromNetkeiba } from '../actions';

export function UpdateNetkeibaOddsButton({ raceId, className }: { raceId: string; className?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleUpdate() {
    startTransition(async () => {
      try {
        await updateOddsFromNetkeiba(raceId);
        toast.success('オッズを更新しました');
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'オッズの更新に失敗しました');
      }
    });
  }

  return (
    <Button variant="outline" onClick={handleUpdate} disabled={isPending} className={className}>
      <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', isPending && 'animate-spin')} />
      {isPending ? 'オッズ更新中...' : 'オッズを更新'}
    </Button>
  );
}
