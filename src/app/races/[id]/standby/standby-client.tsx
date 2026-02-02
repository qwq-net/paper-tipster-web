'use client';

import { useRaceEvents } from '@/features/betting/lib/hooks/use-race-events';
import { PayoutResult, useRaceResults } from '@/features/betting/lib/hooks/use-race-results';
import { PayoutResultModal } from '@/features/betting/ui/payout-result-modal';
import { FormattedDate } from '@/shared/ui/formatted-date';
import { AlarmClock, Loader2, WifiOff } from 'lucide-react';
import { useCallback, useState } from 'react';

interface StandbyClientProps {
  race: {
    id: string;
    name: string;
    location: string;
    date: string;
    closingAt: Date | null;
  };
  initialResults?: PayoutResult[];
  isFinalized: boolean;
  hasTickets?: boolean;
}

export function StandbyClient({
  race,
  initialResults = [],
  isFinalized: initialIsFinalized,
  hasTickets,
}: StandbyClientProps) {
  const [showModal, setShowModal] = useState(false);

  const { results, fetchResults } = useRaceResults(race.id, initialResults, initialIsFinalized);

  const handleRaceBroadcast = useCallback(async () => {
    await fetchResults();
    setShowModal(true);
  }, [fetchResults]);

  const { connectionStatus } = useRaceEvents({
    raceId: race.id,
    isFinalized: initialIsFinalized,
    onRaceBroadcast: handleRaceBroadcast,
  });

  return (
    <>
      {}
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span
              className={`rounded px-2 py-0.5 text-xs font-bold text-white ${
                initialIsFinalized ? 'bg-gray-600' : 'bg-green-600'
              }`}
            >
              {initialIsFinalized ? '確定済み' : '待機中'}
            </span>
            <span className="text-sm font-medium text-gray-400">
              {race.location} {race.name}
              {race.closingAt && (
                <span className="ml-3 inline-flex items-center gap-1 font-bold text-red-500/80">
                  <AlarmClock className="h-3.5 w-3.5" />
                  締切: <FormattedDate date={race.closingAt} options={{ hour: '2-digit', minute: '2-digit' }} />
                </span>
              )}
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            {initialIsFinalized ? 'レース結果' : '結果発表を待機中'}
          </h1>
        </div>

        {initialIsFinalized && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-blue-700 active:scale-95"
          >
            払戻結果を詳しく表示
          </button>
        )}
      </div>

      {!initialIsFinalized && !hasTickets && (
        <div className="mb-8 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Loader2 className="h-8 w-8 animate-spin" />
              <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20"></div>
            </div>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">レースの確定を待っています</h2>
          <p className="text-sm text-gray-500">
            購入した馬券はありませんが、確定後に結果（払戻金等）の確認が可能です。
            <br />
            発表されるまでこの画面のままお待ちください。
          </p>
        </div>
      )}

      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
        {connectionStatus === 'CONNECTED' && (
          <>
            <div className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
            </div>
            <span className="text-green-400">LIVE CONNECTION</span>
          </>
        )}
        {connectionStatus === 'CONNECTING' && (
          <>
            <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
            <span className="text-yellow-500">CONNECTING...</span>
          </>
        )}
        {connectionStatus === 'DISCONNECTED' && !initialIsFinalized && (
          <>
            <WifiOff className="h-3 w-3 text-red-500" />
            <span className="text-red-500">CONNECTION LOST</span>
          </>
        )}
        {initialIsFinalized && <span className="text-gray-400">RACE FINISHED</span>}
      </div>

      <PayoutResultModal
        open={showModal}
        onOpenChange={setShowModal}
        raceName={race.name}
        raceDate={`${race.location} ${race.date}`}
        results={results}
      />
    </>
  );
}
