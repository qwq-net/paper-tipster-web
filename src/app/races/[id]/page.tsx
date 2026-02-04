import { getEntriesForRace, getRaceById } from '@/features/admin/manage-entries/actions';
import { BetTable } from '@/features/betting/ui/bet-table';
import { getEventWallets } from '@/features/economy/wallet';
import { auth } from '@/shared/config/auth';
import { Button, Card, CardContent } from '@/shared/ui';
import { ChevronLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export default async function RacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const [race, entries, wallets] = await Promise.all([
    getRaceById(id),
    getEntriesForRace(id),
    getEventWallets(session.user.id),
  ]);

  if (!race) {
    notFound();
  }

  const wallet = wallets.find((w) => w.eventId === race.eventId);

  if (!wallet) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Info className="mx-auto mb-4 h-12 w-12 text-blue-500" />
            <h2 className="mb-2 text-xl font-semibold">ウォレットが見つかりません</h2>
            <p className="text-gray-500">
              馬券を購入するには、まずマイページからイベントに参加して資金を受け取ってください。
            </p>
            <Link href="/mypage/claim">
              <Button className="mt-6">お小遣いを貰いに行く</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 lg:p-8">
      <div className="w-full max-w-5xl space-y-8">
        <Link
          href="/mypage/sokupat"
          className="mb-6 flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft size={16} />
          即PATトップへ戻る
        </Link>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-500">{race.location}</span>
              {race.raceNumber && (
                <span className="flex h-5 w-7 items-center justify-center rounded bg-gray-100 text-sm font-semibold text-gray-600">
                  {race.raceNumber}R
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl font-semibold text-gray-900">{race.name}</h1>
              <Link href={`/races/${id}/standby`}>
                <Button variant="outline" className="font-semibold">
                  購入馬券確認・結果待機
                </Button>
              </Link>
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

        <BetTable
          raceId={race.id}
          walletId={wallet.id}
          balance={wallet.balance}
          entries={entries}
          initialStatus={race.status}
          closingAt={race.closingAt ? race.closingAt.toISOString() : null}
        />
      </div>
    </div>
  );
}
