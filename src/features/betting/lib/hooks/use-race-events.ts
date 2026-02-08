import { SSEMessage, useSSE } from '@/shared/hooks/use-sse';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';

interface UseRaceEventsProps {
  raceId: string;
  isFinalized: boolean;
  onRaceBroadcast?: () => void;
  onRaceOddsUpdated?: (data: SSEMessage) => void;
}

export function useRaceEvents({ raceId, isFinalized, onRaceBroadcast, onRaceOddsUpdated }: UseRaceEventsProps) {
  const router = useRouter();

  const handleMessage = useCallback(
    (data: SSEMessage) => {
      if (data.type === 'RACE_BROADCAST' && data.raceId === raceId) {
        toast.success('レース結果が発表されました！');
        onRaceBroadcast?.();
        router.refresh();
      }

      if (data.type === 'RACE_ODDS_UPDATED' && data.raceId === raceId) {
        onRaceOddsUpdated?.(data);
      }
    },
    [raceId, onRaceBroadcast, router, onRaceOddsUpdated]
  );

  const { connectionStatus } = useSSE({
    url: '/api/events/race-status',
    onMessage: handleMessage,
    disabled: isFinalized,
  });

  return { connectionStatus };
}
