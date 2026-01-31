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

  const wallet = wallets[0];

  if (!wallet) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Info className="mx-auto mb-4 h-12 w-12 text-blue-500" />
            <h2 className="mb-2 text-xl font-bold">ウォレットが見つかりません</h2>
            <p className="text-gray-500">
              馬券を購入するには、まずマイページからイベントに参加して資金を受け取ってください。
            </p>
            <Link href="/mypage">
              <Button className="mt-6">マイページへ戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4 lg:p-8">
      <Link
        href="/mypage"
        className="mb-6 flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900"
      >
        <ChevronLeft size={16} />
        マイページへ戻る
      </Link>

      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-3">
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700">
            {race.location} {race.distance}m ({race.surface})
          </span>
          <span className="text-sm font-medium text-gray-400">{race.date}</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900">{race.name}</h1>
      </div>

      <BetTable raceId={race.id} walletId={wallet.id} balance={wallet.balance} entries={entries} />
    </div>
  );
}
