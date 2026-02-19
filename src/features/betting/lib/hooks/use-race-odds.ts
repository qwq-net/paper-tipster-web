'use client';

import { fetchRaceOdds } from '@/features/betting/actions';
import { useRaceEvents } from '@/features/betting/lib/hooks/use-race-events';
import type { SSERaceOddsUpdatedMessage } from '@/shared/lib/sse/types';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

type OddsData = Awaited<ReturnType<typeof fetchRaceOdds>>;

export function useRaceOdds(raceId: string, initialOdds: OddsData, isFinalized: boolean = false) {
  const [odds, setOdds] = useState<OddsData>(initialOdds);

  const handleOddsUpdated = useCallback((message: SSERaceOddsUpdatedMessage) => {
    const nextOdds = message.data as OddsData;
    setOdds(nextOdds);
    toast.info('オッズが更新されました');
  }, []);

  useRaceEvents({
    raceId,
    isFinalized,
    onRaceOddsUpdated: handleOddsUpdated,
  });

  return odds;
}
