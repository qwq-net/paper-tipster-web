'use client';

import { fetchRaceOdds } from '@/features/betting/actions';
import { useRaceEvents } from '@/features/betting/lib/hooks/use-race-events';
import { SSEMessage } from '@/shared/hooks/use-sse';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

type OddsData = Awaited<ReturnType<typeof fetchRaceOdds>>;

export function useRaceOdds(raceId: string, initialOdds: OddsData, isFinalized: boolean = false) {
  const [odds, setOdds] = useState<OddsData>(initialOdds);

  const handleOddsUpdated = useCallback((message: SSEMessage) => {
    const data = message.data as OddsData | undefined;
    if (data) {
      setOdds(data);
      toast.info('オッズが更新されました');
    }
  }, []);

  useRaceEvents({
    raceId,
    isFinalized,
    onRaceOddsUpdated: handleOddsUpdated,
  });

  return odds;
}
