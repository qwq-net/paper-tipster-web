'use client';

import { placeBet } from '@/features/betting/actions';
import { calculateBetCount, getValidBetCombinations } from '@/features/betting/lib/calculations';
import { getBetTypeColumnCount, getBetTypeColumnLabels } from '@/features/betting/model/bet-types';
import { getBracketColor } from '@/shared/utils/bracket';
import { getGenderAge, getGenderBadgeClass } from '@/shared/utils/gender';
import { BET_TYPE_LABELS, BET_TYPES, BetType } from '@/types/betting';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

interface Entry {
  id: string;
  bracketNumber: number | null;
  horseNumber: number | null;
  horseName: string;
  horseGender: string;
  horseAge: number | null;
}

interface BetTableProps {
  raceId: string;
  walletId: string;
  balance: number;
  entries: Entry[];
}

const BET_TYPE_ORDER: BetType[] = [
  BET_TYPES.WIN,
  BET_TYPES.PLACE,
  BET_TYPES.BRACKET_QUINELLA,
  BET_TYPES.QUINELLA,
  BET_TYPES.WIDE,
  BET_TYPES.EXACTA,
  BET_TYPES.TRIFECTA,
  BET_TYPES.TRIO,
];

export function BetTable({ raceId, walletId, balance, entries }: BetTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [betType, setBetType] = useState<BetType>(BET_TYPES.WIN);
  const [selections, setSelections] = useState<Set<number>[]>([new Set(), new Set(), new Set()]);
  const [amount, setAmount] = useState<number>(100);

  const columnCount = getBetTypeColumnCount(betType);
  const columnLabels = getBetTypeColumnLabels(betType);

  const bracketHorseCount = new Map<number, number>();
  entries.forEach((entry) => {
    const bracket = entry.bracketNumber!;
    bracketHorseCount.set(bracket, (bracketHorseCount.get(bracket) || 0) + 1);
  });

  const selectionsArray = selections.slice(0, columnCount).map((s) => Array.from(s));
  const betCount = calculateBetCount(selectionsArray, betType, bracketHorseCount);
  const totalAmount = betCount * amount;

  const handleBetTypeChange = (newType: BetType) => {
    setBetType(newType);
    setSelections([new Set(), new Set(), new Set()]);
  };

  const handleCheckboxChange = (columnIndex: number, horseNumber: number) => {
    setSelections((prev) => {
      const newSelections = [...prev];
      const newSet = new Set(prev[columnIndex]);
      if (newSet.has(horseNumber)) {
        newSet.delete(horseNumber);
      } else {
        newSet.add(horseNumber);
      }
      newSelections[columnIndex] = newSet;
      return newSelections;
    });
  };

  const handleSubmit = async () => {
    if (betCount === 0) {
      toast.error('馬を選択してください');
      return;
    }

    if (amount < 100) {
      toast.error('100円以上で入力してください');
      return;
    }

    if (totalAmount > balance) {
      toast.error('残高が不足しています');
      return;
    }

    const validCombinations = getValidBetCombinations(selectionsArray, betType, bracketHorseCount);

    startTransition(async () => {
      try {
        for (const combo of validCombinations) {
          await placeBet({
            raceId,
            walletId,
            details: {
              type: betType,
              selections: combo,
            },
            amount,
          });
        }
        toast.success(`${betCount}点の馬券を購入しました`);
        setSelections([new Set(), new Set(), new Set()]);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'エラーが発生しました');
      }
    });
  };

  const isBracketType = betType === BET_TYPES.BRACKET_QUINELLA;

  const bracketGroups = isBracketType
    ? entries.reduce(
        (acc, entry) => {
          const bracket = entry.bracketNumber!;
          if (!acc[bracket]) {
            acc[bracket] = [];
          }
          acc[bracket].push(entry);
          return acc;
        },
        {} as Record<number, Entry[]>
      )
    : {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-lg bg-gray-100 p-2">
        {BET_TYPE_ORDER.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => handleBetTypeChange(type)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              betType === type ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {BET_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="px-2 py-2 text-xs font-bold">枠番</th>
              <th className="px-2 py-2 text-xs font-bold">馬番</th>
              <th className="px-2 py-2 text-xs font-bold">馬名</th>
              <th className="px-2 py-2 text-xs font-bold">性齢</th>
              {columnLabels.map((label, i) => (
                <th key={i} className="px-2 py-2 text-center text-xs font-bold">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isBracketType
              ? Object.entries(bracketGroups).map(([bracket, bracketEntries]) =>
                  bracketEntries.map((entry, idx) => (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-300 transition-colors last:border-0 hover:bg-gray-50"
                    >
                      {idx === 0 && (
                        <td className="px-2 align-middle" rowSpan={bracketEntries.length}>
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${getBracketColor(Number(bracket))}`}
                          >
                            {bracket}
                          </span>
                        </td>
                      )}
                      <td className="px-2 py-2 text-sm font-bold">{entry.horseNumber}</td>
                      <td className="px-2 py-2 text-sm font-bold">{entry.horseName}</td>
                      <td className="px-2 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${getGenderBadgeClass(entry.horseGender)}`}
                        >
                          {getGenderAge(entry.horseGender, entry.horseAge)}
                        </span>
                      </td>
                      {idx === 0 &&
                        Array.from({ length: columnCount }).map((_, colIdx) => (
                          <td key={colIdx} className="px-2 text-center align-middle" rowSpan={bracketEntries.length}>
                            <input
                              type="checkbox"
                              checked={selections[colIdx].has(Number(bracket))}
                              onChange={() => handleCheckboxChange(colIdx, Number(bracket))}
                              className="text-primary focus:ring-primary h-5 w-5 cursor-pointer rounded border-gray-300"
                            />
                          </td>
                        ))}
                    </tr>
                  ))
                )
              : entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-gray-300 transition-colors last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-2 py-2">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${getBracketColor(entry.bracketNumber!)}`}
                      >
                        {entry.bracketNumber}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-sm font-bold">{entry.horseNumber}</td>
                    <td className="px-2 py-2 text-sm font-bold">{entry.horseName}</td>
                    <td className="px-2 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getGenderBadgeClass(entry.horseGender)}`}
                      >
                        {getGenderAge(entry.horseGender, entry.horseAge)}
                      </span>
                    </td>
                    {Array.from({ length: columnCount }).map((_, colIdx) => (
                      <td key={colIdx} className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={selections[colIdx].has(entry.horseNumber!)}
                          onChange={() => handleCheckboxChange(colIdx, entry.horseNumber!)}
                          className="text-primary focus:ring-primary h-5 w-5 cursor-pointer rounded border-gray-300"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-gray-50 p-4">
        <div className="flex items-center gap-6">
          <div className="text-sm">
            <span className="text-gray-500">購入点数:</span>
            <span className="text-primary ml-2 text-xl font-bold">{betCount}点</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">1点あたり:</label>
            <input
              type="number"
              min={100}
              step={100}
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value, 10) || 100)}
              className="w-24 rounded-md border border-gray-300 px-3 py-2 text-right text-sm"
            />
            <span className="text-sm text-gray-500">円</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">合計:</span>
            <span className="ml-2 text-xl font-bold">{totalAmount.toLocaleString()}円</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">残高: {balance.toLocaleString()}円</span>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || betCount === 0 || totalAmount > balance}
            className="from-primary to-primary/80 hover:to-primary rounded-lg bg-linear-to-r px-8 py-3 font-bold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                購入中...
              </>
            ) : (
              '購入確定'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
