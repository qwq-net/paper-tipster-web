'use client';

import { BET_TYPE_LABELS, BetType } from '@/types/betting';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

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
      <div className="py-10 text-center text-gray-500">
        <p>購入した馬券はありません</p>
      </div>
    );
  }

  const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.amount, 0);
  const totalPayout = tickets.reduce((sum, ticket) => sum + (ticket.payout || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div>
          <div className="mb-1 text-xs font-bold text-gray-500">購入合計</div>
          <div className="text-xl font-black text-gray-900">{totalAmount.toLocaleString()}円</div>
        </div>
        {(totalPayout > 0 || tickets.some((t) => t.status !== 'PENDING')) && (
          <div className="text-right">
            <div className="mb-1 text-xs font-bold text-gray-500">払戻合計</div>
            <div className={`text-xl font-black ${totalPayout > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {totalPayout.toLocaleString()}円
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            {}
            <div
              className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                ticket.status === 'HIT' ? 'bg-red-500' : ticket.status === 'LOST' ? 'bg-gray-300' : 'bg-blue-500'
              }`}
            />

            <div className="flex items-center justify-between py-3 pr-4 pl-5">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-500">
                    {BET_TYPE_LABELS[ticket.type]}
                  </span>
                  {ticket.status === 'HIT' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                      <CheckCircle2 size={12} />
                      的中
                    </span>
                  )}
                  {ticket.status === 'LOST' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-gray-400">
                      <XCircle size={12} />
                      不的中
                    </span>
                  )}
                  {ticket.status === 'PENDING' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-blue-500">
                      <Clock size={12} />
                      待機中
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {ticket.selections.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm font-bold text-gray-800">
                      {idx > 0 && <span className="text-gray-300">-</span>}
                      <span className="font-mono text-lg">{s.horseNumber || s.bracketNumber}</span>
                      <span className="max-w-[80px] truncate text-xs font-normal text-gray-500 sm:max-w-none">
                        {s.horseName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">{ticket.amount.toLocaleString()}円</div>
                {ticket.status === 'HIT' && (
                  <div className="mt-0.5 text-xs font-bold text-red-600">{ticket.payout?.toLocaleString()}円</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
