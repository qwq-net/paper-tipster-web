import { SSEMessage } from '@/shared/hooks/use-sse';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UseRaceTimerProps {
  raceId: string;
  initialStatus: string;
  closingAt: string | null;
}

export function useRaceTimer({ raceId, initialStatus, closingAt }: UseRaceTimerProps) {
  const router = useRouter();
  const [isClosed, setIsClosed] = useState(initialStatus !== 'SCHEDULED');

  useEffect(() => {
    if (!closingAt || isClosed) return;

    const updateTimer = () => {
      const now = new Date();
      const closing = new Date(closingAt);
      const diff = closing.getTime() - now.getTime();

      if (diff <= 0) {
        setIsClosed(true);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [closingAt, isClosed]);

  const handleSSEMessage = useCallback(
    (data: SSEMessage) => {
      if (!('raceId' in data)) return;
      if (data.raceId !== raceId) return;

      if (data.type === 'RACE_CLOSED' || data.type === 'RACE_FINALIZED' || data.type === 'RACE_BROADCAST') {
        setIsClosed(true);
        if (data.type === 'RACE_BROADCAST') {
          toast.success('レース結果が確定しました！結果画面へ移動します。');
          router.push(`/races/${raceId}/standby`);
        } else {
          toast.info('このレースの受付は終了しました');
        }
      } else if (data.type === 'RACE_REOPENED') {
        setIsClosed(false);
        toast.success('レースの受付が再開されました！');
        router.refresh();
      }
    },
    [raceId, router]
  );

  return { isClosed, handleSSEMessage };
}
