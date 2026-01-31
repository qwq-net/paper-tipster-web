import { getEntriesForRace, getRaceById } from '@/features/admin/manage-entries/actions';
import { BetForm } from '@/features/betting/ui/bet-form';
import { getEventWallets } from '@/features/economy/wallet';
import { auth } from '@/shared/config/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
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

  // とりあえず最初のウォレットを使用（本来はイベントに紐づくものを選択させるべきだが、今回はシンプルに）
  // 実際にはレースがどのイベントに関連しているかの紐付けが必要だが、現在のスキーマでは独立しているため
  // ユーザーが持っている最初の有効なウォレットを使用する
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
    <div className="mx-auto max-w-4xl p-4 lg:p-8">
      <Link
        href="/mypage"
        className="mb-6 flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900"
      >
        <ChevronLeft size={16} />
        マイページへ戻る
      </Link>

      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-3">
          <span className="bg-secondary text-secondary-foreground rounded px-2 py-0.5 text-xs font-bold">
            {race.location} {race.distance}m ({race.surface})
          </span>
          <span className="text-sm font-medium text-gray-400">{race.date}</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900">{race.name}</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>出馬表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 py-3 font-bold">枠</th>
                      <th className="px-2 py-3 font-bold">番</th>
                      <th className="px-2 py-3 font-bold">馬名</th>
                      <th className="px-2 py-3 font-bold">性別</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id} className="border-b last:border-0">
                        <td className="px-2 py-3">
                          <span
                            className="inline-flex h-6 w-6 items-center justify-center rounded-sm text-xs font-bold text-white"
                            style={{
                              backgroundColor: getBracketColor(entry.bracketNumber || 0),
                              color: entry.bracketNumber && entry.bracketNumber <= 2 ? 'black' : 'white',
                            }}
                          >
                            {entry.bracketNumber}
                          </span>
                        </td>
                        <td className="px-2 py-3 font-bold">{entry.horseNumber}</td>
                        <td className="px-2 py-3 font-bold">{entry.horseName}</td>
                        <td className="px-2 py-3 text-gray-500">{entry.horseGender}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <BetForm raceId={race.id} walletId={wallet.id} balance={wallet.balance} entries={entries} />
        </div>
      </div>
    </div>
  );
}

function getBracketColor(num: number): string {
  switch (num) {
    case 1:
      return '#FFFFFF'; // 白
    case 2:
      return '#000000'; // 黒
    case 3:
      return '#FF0000'; // 赤
    case 4:
      return '#0000FF'; // 青
    case 5:
      return '#FFFF00'; // 黄
    case 6:
      return '#008000'; // 緑
    case 7:
      return '#FFA500'; // 橙
    case 8:
      return '#FFC0CB'; // 桃
    default:
      return '#CCCCCC';
  }
}

import { Button } from '@/shared/ui';
