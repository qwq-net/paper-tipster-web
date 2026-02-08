import { SSEMessage, useSSE } from '@/shared/hooks/use-sse';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { RankingData } from '../actions';

interface UseRankingEventsProps {
  eventId: string;
  onRankingUpdated?: (data: { published: boolean; ranking?: RankingData[] }) => void;
}

export function useRankingEvents({ eventId, onRankingUpdated }: UseRankingEventsProps) {
  const handleMessage = useCallback(
    (data: SSEMessage) => {
      if (data.type === 'RANKING_UPDATED' && data.eventId === eventId) {
        if (data.published) {
          toast.success('ランキングが公開されました！');
        } else {
          toast.info('ランキングが非公開になりました');
        }
        onRankingUpdated?.({
          published: data.published as boolean,
          ranking: data.ranking as RankingData[],
        });
      }
    },
    [eventId, onRankingUpdated]
  );

  const { connectionStatus } = useSSE({
    url: '/api/events/race-status',
    onMessage: handleMessage,
  });

  return { connectionStatus };
}
