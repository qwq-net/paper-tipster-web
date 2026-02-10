'use client';

import { compressBetSelections, CompressedRow } from '@/features/betting/lib/compress-selections';
import { Badge } from '@/shared/ui';
import { getBracketColor } from '@/shared/utils/bracket';
import { cn } from '@/shared/utils/cn';
import { BET_TYPE_LABELS, BetType } from '@/types/betting';
import { ChevronDown, ChevronUp, Play } from 'lucide-react';
import { useState } from 'react';

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

interface BetGroup {
  id: string;
  type: BetType;
  totalAmount: number;
  createdAt: Date;
  bets: BetTicket[];
}

interface PurchasedTicketListProps {
  ticketGroups: BetGroup[];
}

export function PurchasedTicketList({ ticketGroups }: PurchasedTicketListProps) {
  if (ticketGroups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/30 py-12 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <span className="text-xl">🎫</span>
        </div>
        <p className="text-sm font-semibold text-gray-400">購入した馬券はありません</p>
      </div>
    );
  }

  const totalAmount = ticketGroups.reduce((sum, group) => sum + group.totalAmount, 0);
  const totalPayout = ticketGroups.reduce(
    (sum, group) => sum + group.bets.reduce((bSum, bet) => bSum + (bet.payout || 0), 0),
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <div className="mb-1 text-sm font-semibold text-gray-500">購入合計</div>
          <div className="text-xl font-semibold text-gray-900">{totalAmount.toLocaleString()}円</div>
        </div>
        {totalPayout > 0 && (
          <div className="text-right">
            <div className="mb-1 text-sm font-semibold text-gray-500">払戻合計</div>
            <div className="text-xl font-semibold text-red-600">{totalPayout.toLocaleString()}円</div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {ticketGroups.map((group) => (
          <TicketGroupItem key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}

function TicketGroupItem({ group }: { group: BetGroup }) {
  const [isOpen, setIsOpen] = useState(true);

  const groupPayout = group.bets.reduce((sum, bet) => sum + (bet.payout || 0), 0);
  const isHit = group.bets.some((bet) => bet.status === 'HIT');
  const isLost = group.bets.every((bet) => bet.status === 'LOST');
  const isPending = group.bets.some((bet) => bet.status === 'PENDING');

  const getGroupStatusBadge = () => {
    if (isHit) return <Badge variant="status" label="的中" className="bg-red-100 text-red-800" />;
    if (isLost && !isPending) return <Badge variant="status" label="不的中" className="bg-gray-100 text-gray-500" />;
    return null;
  };

  const unitAmount = group.bets[0]?.amount || 0;
  const betCount = group.bets.length;

  const horseToBracket = new Map<number, number>();
  group.bets.forEach((bet) => {
    bet.selections.forEach((sel) => {
      if (sel.bracketNumber) {
        horseToBracket.set(sel.horseNumber, sel.bracketNumber);
      }
    });
  });

  const winningBets = group.bets.filter((bet) => bet.status === 'HIT');
  const otherBets = group.bets.filter((bet) => bet.status !== 'HIT');

  let compressedRows: CompressedRow[];

  if (winningBets.length > 0) {
    const winningRows = compressBetSelections(
      winningBets.map((b) => ({
        selections: b.selections.map((s) => s.horseNumber || s.bracketNumber || 0),
        status: b.status,
      }))
    );

    const otherRows = compressBetSelections(
      otherBets.map((b) => ({
        selections: b.selections.map((s) => s.horseNumber || s.bracketNumber || 0),
        status: b.status,
      }))
    );

    compressedRows = [...winningRows, ...otherRows];
  } else {
    compressedRows = compressBetSelections(
      group.bets.map((b) => ({
        selections: b.selections.map((s) => s.horseNumber || s.bracketNumber || 0),
        status: b.status,
      }))
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      <div
        className="flex cursor-pointer items-center justify-between bg-gray-50/50 p-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
            {isOpen ? (
              <ChevronUp size={20} className="text-gray-500" />
            ) : (
              <ChevronDown size={20} className="text-gray-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{BET_TYPE_LABELS[group.type]}</span>
              {getGroupStatusBadge()}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-900">
            {unitAmount.toLocaleString()}円 × {betCount}点 = {group.totalAmount.toLocaleString()}円
          </div>
          {groupPayout > 0 && (
            <div className="text-sm font-semibold text-red-600">+{groupPayout.toLocaleString()}円</div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-gray-100 p-4">
          <div className="space-y-2">
            {compressedRows.map((row, idx) => (
              <CompressedRowItem key={idx} row={row} horseToBracket={horseToBracket} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompressedRowItem({ row, horseToBracket }: { row: CompressedRow; horseToBracket: Map<number, number> }) {
  return (
    <div
      className={cn(
        'relative flex items-center gap-3 overflow-x-auto rounded-lg px-3 py-3',
        row.hasHit ? 'bg-red-50 ring-1 ring-red-200 ring-inset' : 'bg-gray-50 ring-1 ring-gray-100 ring-inset'
      )}
    >
      <div className="flex shrink-0 items-center gap-2">
        {row.positions.map((posGroup, posIdx) => (
          <div key={posIdx} className="flex items-center gap-2">
            {posIdx > 0 && <Play size={10} className="text-gray-400" fill="currentColor" />}
            <div
              className={cn(
                'grid gap-1',
                posGroup.length > 6
                  ? 'grid-cols-3 sm:grid-cols-4'
                  : posGroup.length > 4
                    ? 'grid-cols-2 sm:grid-cols-3'
                    : posGroup.length > 2
                      ? 'grid-cols-2'
                      : 'grid-cols-1'
              )}
            >
              {posGroup.map((num) => (
                <div
                  key={num}
                  className={cn(
                    'flex h-7 w-8 items-center justify-center rounded font-mono text-sm font-semibold shadow-sm ring-1 ring-black/5',
                    getBracketColor(horseToBracket.get(num) ?? null)
                  )}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky right-0 ml-auto flex shrink-0 flex-col items-end gap-1 pl-4">
        {row.hasHit && (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-sm font-semibold text-red-700">
            的中
          </span>
        )}
        <span className="text-sm font-medium whitespace-nowrap text-gray-400">{row.betCount}点</span>
      </div>
    </div>
  );
}
