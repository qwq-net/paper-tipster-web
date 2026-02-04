'use client';

import { useRaceEvents } from '@/features/betting/lib/hooks/use-race-events';
import { PayoutResult, useRaceResults } from '@/features/betting/lib/hooks/use-race-results';
import { PayoutResultModal } from '@/features/betting/ui/payout-result-modal';
import { Badge, Button, LiveConnectionStatus } from '@/shared/ui';
import { Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';

interface StandbyClientProps {
  race: {
    id: string;
    name: string;
    location: string;
    date: string;
    closingAt: Date | null;
    raceNumber?: number | null;
    surface: string;
    distance: number;
  };
  initialResults?: PayoutResult[];
  isFinalized: boolean;
  hasTickets?: boolean;
  entryCount: number;
}

export function StandbyClient({
  race,
  initialResults = [],
  isFinalized: initialIsFinalized,
  hasTickets,
  entryCount,
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
      <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span
              className={`rounded px-2 py-0.5 text-sm font-semibold text-white ${
                initialIsFinalized ? 'bg-gray-600' : 'bg-green-600'
              }`}
            >
              {initialIsFinalized ? '確定済み' : '待機中'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-500">{race.location}</span>
              {race.raceNumber && (
                <span className="flex h-5 w-7 items-center justify-center rounded bg-gray-100 text-sm font-semibold text-gray-600">
                  {race.raceNumber}R
                </span>
              )}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              {initialIsFinalized ? race.name : '結果発表を待機中'}
            </h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
              <span>{race.surface}</span>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span>{race.distance}m</span>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span>{entryCount}頭</span>
            </div>
          </div>
        </div>

        {initialIsFinalized && hasTickets && (
          <Button onClick={() => setShowModal(true)} variant="primary" className="px-6 font-semibold">
            払戻結果を確認
          </Button>
        )}
      </div>

      {!initialIsFinalized && !hasTickets && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-linear-to-r from-blue-50 to-white px-6 py-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">確定待ち</span>
            </div>
          </div>
          <div className="p-6">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">レースの確定を待っています</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              購入した馬券はありませんが、発表されるまでこの画面のままお待ちください。
              確定後に結果（払戻金等）の確認が可能です。
            </p>
          </div>
        </div>
      )}

      {initialIsFinalized && !hasTickets && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-linear-to-r from-gray-50 to-white px-6 py-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Badge variant="status" label="情報" className="bg-gray-100 text-gray-600" />
              <span className="text-sm font-semibold">結果発表済み</span>
            </div>
          </div>
          <div className="p-6">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">このレースの結果が発表されました</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              購入した馬券はありませんが、下のボタンから払戻結果のなどの詳細情報を確認いただけます。
            </p>
            <div className="mt-6 flex justify-center">
              <Button
                onClick={() => setShowModal(true)}
                variant="primary"
                className="w-full px-8 font-semibold sm:w-auto"
              >
                払戻結果を確認する
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 shadow-lg backdrop-blur-sm">
        <LiveConnectionStatus status={connectionStatus} showText={true} className="text-white" />
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
