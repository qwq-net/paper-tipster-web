import { getBetsByRace, getRaceWithBets } from '@/features/admin/manage-bets/actions/read';
import { Badge } from '@/shared/ui';
import { FormattedDate } from '@/shared/ui/formatted-date';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: '馬券詳細',
};

interface BetDetailPageProps {
  params: Promise<{ raceId: string }>;
}

export default async function BetDetailPage({ params }: BetDetailPageProps) {
  const { raceId } = await params;
  const race = await getRaceWithBets(raceId);

  if (!race) {
    notFound();
  }

  const bets = await getBetsByRace(raceId);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/bets"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          馬券管理に戻る
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">{race.name}</h1>
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
          <span>{race.event.name}</span>
          <span>•</span>
          <span>{race.location}</span>
          <span>•</span>
          <span>
            {race.surface} {race.distance}m
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        {bets.length === 0 ? (
          <div className="py-12 text-center text-gray-500">このレースに購入された馬券はありません</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider whitespace-nowrap text-gray-400 uppercase">
                    ユーザー
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider whitespace-nowrap text-gray-400 uppercase">
                    券種
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider whitespace-nowrap text-gray-400 uppercase">
                    選択馬
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider whitespace-nowrap text-gray-400 uppercase">
                    金額
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider whitespace-nowrap text-gray-400 uppercase">
                    購入日時
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider whitespace-nowrap text-gray-400 uppercase">
                    状態
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {bets.map((bet) => (
                  <tr key={bet.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                      {bet.user.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <Badge
                        variant="status"
                        label={
                          BET_TYPE_LABELS[(bet.details as { type?: BetType })?.type as BetType] ||
                          (bet.details as { type?: string })?.type ||
                          'Unknown'
                        }
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap text-gray-900">
                      {JSON.stringify((bet.details as { selections?: unknown })?.selections || [])}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap text-gray-900">
                      {bet.amount.toLocaleString()}円
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      <FormattedDate date={bet.createdAt} />
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      {bet.status === 'PENDING' ? (
                        <span className="text-gray-400">未確定</span>
                      ) : bet.status === 'HIT' ? (
                        <span className="font-semibold text-green-600">的中</span>
                      ) : bet.status === 'LOST' ? (
                        <span className="text-gray-400">不的中</span>
                      ) : (
                        <span className="text-gray-400">{bet.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-500">総馬券数</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{bets.length}枚</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">総投票額</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {bets.reduce((sum, bet) => sum + bet.amount, 0).toLocaleString()}円
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">的中馬券数</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {bets.filter((bet) => bet.status === 'HIT').length}枚
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
