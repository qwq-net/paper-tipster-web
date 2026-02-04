import { SSEMessage, useSSE } from '@/shared/hooks/use-sse';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';

interface UseRaceEventsProps {
  raceId: string;
  isFinalized: boolean;
  onRaceBroadcast?: () => void;
}

export function useRaceEvents({ raceId, isFinalized, onRaceBroadcast }: UseRaceEventsProps) {
  const router = useRouter();

  const handleMessage = useCallback(
    (data: SSEMessage) => {
      if (data.type === 'RACE_BROADCAST' && data.raceId === raceId) {
        toast.success('レース結果が発表されました！');
        onRaceBroadcast?.();
        router.refresh();
      }
    },
    [raceId, onRaceBroadcast, router]
  );

  const { connectionStatus } = useSSE({
    url: '/api/events/race-status',
    onMessage: handleMessage,
    disabled: isFinalized,
  });

  return { connectionStatus };
}
