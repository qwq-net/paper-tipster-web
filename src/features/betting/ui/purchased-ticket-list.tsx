'use client';

import { Badge } from '@/shared/ui';
import { BET_TYPE_LABELS, BetType } from '@/types/betting';

interface BetTicket {
  id: string;
  type: BetType;
  selections: {
    horseNumber: number;
    bracketNumber?: number;
    horseName: string;
    horseGender: string;
    horseAge: number;
  }[];
  amount: number;
  status: 'PENDING' | 'HIT' | 'LOST' | 'REFUNDED';
  payout?: number;
  odds?: string;
  createdAt: Date;
}

interface PurchasedTicketListProps {
  tickets: BetTicket[];
}

export function PurchasedTicketList({ tickets }: PurchasedTicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/30 py-12 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <span className="text-xl">🎫</span>
        </div>
        <p className="text-sm font-semibold text-gray-400">購入した馬券はありません</p>
      </div>
    );
  }

  const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.amount, 0);
  const totalPayout = tickets.reduce((sum, ticket) => sum + (ticket.payout || 0), 0);

  const getStatusBadge = (status: BetTicket['status']) => {
    switch (status) {
      case 'HIT':
        return <Badge variant="status" label="的中" className="bg-red-100 text-red-800" />;
      case 'LOST':
        return <Badge variant="status" label="不的中" className="bg-gray-100 text-gray-500" />;
      case 'PENDING':
        return <Badge variant="status" label="待機中" className="bg-blue-100 text-blue-800" />;
      case 'REFUNDED':
        return <Badge variant="status" label="返還" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <div className="mb-1 text-sm font-semibold text-gray-500">購入合計</div>
          <div className="text-xl font-semibold text-gray-900">{totalAmount.toLocaleString()}円</div>
        </div>
        {(totalPayout > 0 || tickets.some((t) => t.status !== 'PENDING')) && (
          <div className="text-right">
            <div className="mb-1 text-sm font-semibold text-gray-500">払戻合計</div>
            <div className={`text-xl font-semibold ${totalPayout > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {totalPayout.toLocaleString()}円
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            <div
              className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                ticket.status === 'HIT' ? 'bg-red-500' : ticket.status === 'LOST' ? 'bg-gray-300' : 'bg-blue-500'
              }`}
            />

            <div className="flex items-center justify-between py-3 pr-4 pl-5">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-sm font-semibold text-gray-500">
                    {BET_TYPE_LABELS[ticket.type]}
                  </span>
                  {getStatusBadge(ticket.status)}
                </div>

                <div className="flex items-center gap-3">
                  {ticket.selections.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      {idx > 0 && <span className="text-gray-300">-</span>}
                      <span className="font-mono text-lg">{s.horseNumber || s.bracketNumber}</span>
                      <span className="max-w-[80px] truncate text-sm font-normal text-gray-500 sm:max-w-none">
                        {s.horseName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">{ticket.amount.toLocaleString()}円</div>
                {ticket.status === 'HIT' && (
                  <div className="mt-0.5 text-sm font-semibold text-red-600">{ticket.payout?.toLocaleString()}円</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
