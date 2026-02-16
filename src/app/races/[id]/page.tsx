import { getEntriesForRace, getRaceById } from '@/features/admin/manage-entries/actions';
import { fetchRaceOdds } from '@/features/betting/actions';
import { BetTable } from '@/features/betting/ui/bet-table';
import { LoanBanner } from '@/features/economy/loan/ui/loan-banner';
import { getEventWallets, WalletMissingCard } from '@/features/economy/wallet';
import { getForecastsByRaceId } from '@/features/forecasts/actions';
import { ForecastDisplay } from '@/features/forecasts/components/ForecastDisplay';
import { RankingButton } from '@/features/ranking/components/ranking-button';
import { auth } from '@/shared/config/auth';
import { Button } from '@/shared/ui';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const race = await getRaceById(id);

  if (!race) {
    return {
      title: 'レースが見つかりません',
    };
  }

  return {
    title: race.name,
    description: `${race.venue?.shortName} ${race.raceNumber ? race.raceNumber + 'R' : ''} ${race.name}の予想・オッズ情報`,
  };
}

export default async function RacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const [race, entries, wallets, initialOdds, forecasts] = await Promise.all([
    getRaceById(id),
    getEntriesForRace(id),
    getEventWallets(session.user.id),
    fetchRaceOdds(id),
    getForecastsByRaceId(id),
  ]);

  if (!race) {
    notFound();
  }

  const wallet = wallets.find((w) => w.eventId === race.eventId);

  if (!wallet) {
    return <WalletMissingCard showBackLink={true} />;
  }

  return (
    <div className="flex flex-col items-center p-4 lg:p-8">
      <div className="w-full max-w-5xl space-y-8">
        <Link
          href="/mypage/sokubet"
          className="mb-6 flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft size={16} />
          即BETトップへ戻る
        </Link>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-500">{race.venue?.shortName}</span>
              {race.raceNumber && (
                <span className="flex h-5 w-7 items-center justify-center rounded bg-gray-100 text-sm font-semibold text-gray-600">
                  {race.raceNumber}R
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl font-semibold text-gray-900">{race.name}</h1>
              <div className="flex items-center gap-2">
                <RankingButton eventId={race.eventId} />
                <Link href={`/races/${id}/standby`}>
                  <Button variant="outline" className="font-semibold">
                    購入馬券確認・結果待機
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{race.surface}</span>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span>{race.distance}m</span>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span>{entries.length}頭</span>
            </div>
          </div>
        </div>

        <LoanBanner
          eventId={race.eventId}
          balance={wallet.balance}
          distributeAmount={race.event?.distributeAmount ?? 0}
          loanAmount={race.event?.loanAmount ?? race.event?.distributeAmount ?? 0}
          hasLoaned={wallet.totalLoaned > 0}
        />

        <BetTable
          raceId={race.id}
          walletId={wallet.id}
          balance={wallet.balance}
          entries={entries}
          initialStatus={race.status}
          closingAt={race.closingAt ? race.closingAt.toISOString() : null}
          initialOdds={initialOdds}
        />

        <ForecastDisplay forecasts={forecasts} entries={entries} />
      </div>
    </div>
  );
}
