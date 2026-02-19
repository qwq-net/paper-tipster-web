'use client';

import { Badge } from '@/shared/ui';

interface Bet5Ticket {
  id: string;
  userId: string;
  user: {
    name: string | null;
  };
  race1HorseIds: string[];
  race2HorseIds: string[];
  race3HorseIds: string[];
  race4HorseIds: string[];
  race5HorseIds: string[];
  amount: number;
  isWin: boolean | null;
  payout: number | null;
  createdAt: Date;
}

interface HorseMap {
  [horseId: string]: {
    horseNumber: number | null;
    name: string;
  };
}

interface Bet5TicketListProps {
  tickets: Bet5Ticket[];
  horseMap: HorseMap;
  isFinalized: boolean;
}

export function Bet5TicketList({ tickets, horseMap, isFinalized }: Bet5TicketListProps) {
  const formatHorseIds = (ids: string[]) => {
    return ids
      .map((id) => {
        const horse = horseMap[id];
        return horse ? `${horse.horseNumber || '?'}.${horse.name}` : '不明';
      })
      .join(', ');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tokyo',
      hour12: false,
    }).format(new Date(date));
  };

  const formatYen = (value: number) => new Intl.NumberFormat('ja-JP').format(value);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">購入されたBET5一覧 ({tickets.length}件)</h3>
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[800px] border-collapse text-left">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-100 text-gray-400 italic">
              <th className="px-4 py-3 text-sm font-medium tracking-wider whitespace-nowrap uppercase">購入日時</th>
              <th className="px-4 py-3 text-sm font-medium tracking-wider whitespace-nowrap uppercase">ユーザー</th>
              <th className="px-4 py-3 text-sm font-medium tracking-wider whitespace-nowrap uppercase">
                選択馬 (R1~R5)
              </th>
              <th className="px-4 py-3 text-sm font-medium tracking-wider whitespace-nowrap uppercase">金額</th>
              <th className="px-4 py-3 text-sm font-medium tracking-wider whitespace-nowrap uppercase">状況</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="transition-colors hover:bg-gray-50">
                <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-500">{formatDate(ticket.createdAt)}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{ticket.user?.name || '不明'}</td>
                <td className="px-4 py-3 text-sm leading-relaxed text-gray-600">
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1">
                      <span className="font-semibold text-gray-400">R1:</span> {formatHorseIds(ticket.race1HorseIds)}
                    </div>
                    <div className="flex gap-1">
                      <span className="font-semibold text-gray-400">R2:</span> {formatHorseIds(ticket.race2HorseIds)}
                    </div>
                    <div className="flex gap-1">
                      <span className="font-semibold text-gray-400">R3:</span> {formatHorseIds(ticket.race3HorseIds)}
                    </div>
                    <div className="flex gap-1">
                      <span className="font-semibold text-gray-400">R4:</span> {formatHorseIds(ticket.race4HorseIds)}
                    </div>
                    <div className="flex gap-1">
                      <span className="font-semibold text-gray-400">R5:</span> {formatHorseIds(ticket.race5HorseIds)}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-semibold whitespace-nowrap text-gray-700">
                  {formatYen(ticket.amount)}円
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  {ticket.isWin ? (
                    <div className="flex flex-col items-start gap-1">
                      <Badge label="的中" className="bg-red-100 text-red-700 ring-red-200" />
                      {ticket.payout && (
                        <span className="text-sm font-semibold text-red-600">{formatYen(ticket.payout)}円</span>
                      )}
                    </div>
                  ) : isFinalized ? (
                    <Badge label="不的中" className="bg-gray-100 text-gray-500 ring-gray-200" />
                  ) : (
                    <Badge label="未確定" className="bg-blue-100 text-blue-600 ring-blue-200" />
                  )}
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm font-medium text-gray-400">
                  購入チケットがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
