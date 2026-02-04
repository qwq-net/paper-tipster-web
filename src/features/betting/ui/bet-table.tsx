'use client';

import { placeBet } from '@/features/betting/actions';
import { calculateBetCount, getValidBetCombinations } from '@/features/betting/lib/calculations';
import { getBetTypeColumnCount, getBetTypeColumnLabels } from '@/features/betting/model/bet-types';
import { SSEMessage, useSSE } from '@/shared/hooks/use-sse';
import { Badge, Button, Input, LiveConnectionStatus } from '@/shared/ui';
import { getBracketColor } from '@/shared/utils/bracket';
import { getGenderAge } from '@/shared/utils/gender';
import { BET_TYPE_LABELS, BET_TYPES, BetType } from '@/types/betting';
import { AlertCircle, Calculator, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { NumericKeypad } from './numeric-keypad';

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
  initialStatus: string;
  closingAt: string | null;
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

export function BetTable({ raceId, walletId, balance, entries, initialStatus, closingAt }: BetTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [betType, setBetType] = useState<BetType>(BET_TYPES.WIN);
  const [selections, setSelections] = useState<Set<number>[]>([new Set(), new Set(), new Set()]);
  const [amount, setAmount] = useState<number>(100);
  const [isClosed, setIsClosed] = useState(initialStatus !== 'SCHEDULED');
  const [showKeypad, setShowKeypad] = useState(false);

  useEffect(() => {
    if (!closingAt || isClosed) return;

    const updateTimer = () => {
      const now = new Date();
      const closing = new Date(closingAt);
      const diff = closing.getTime() - now.getTime();

      if (diff <= 0) {
        setIsClosed(true);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [closingAt, isClosed]);

  const handleSSEMessage = useCallback(
    (data: SSEMessage) => {
      if (data.raceId !== raceId) return;

      if (data.type === 'RACE_CLOSED' || data.type === 'RACE_FINALIZED' || data.type === 'RACE_BROADCAST') {
        setIsClosed(true);
        if (data.type === 'RACE_BROADCAST') {
          toast.success('レース結果が確定しました！結果画面へ移動します。');
          router.push(`/races/${raceId}/standby`);
        } else {
          toast.info('このレースの受付は終了しました');
        }
      } else if (data.type === 'RACE_REOPENED') {
        setIsClosed(false);
        toast.success('レースの受付が再開されました！');
        router.refresh();
      }
    },
    [raceId, router]
  );

  const { connectionStatus } = useSSE({
    url: '/api/events/race-status',
    onMessage: handleSSEMessage,
  });

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
        toast.success(`${totalAmount.toLocaleString()}円分の馬券を購入しました`);
        setSelections([new Set(), new Set(), new Set()]);
        setAmount(100);
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
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 shadow-lg backdrop-blur-sm">
        <LiveConnectionStatus status={connectionStatus} showText={true} className="text-white" />
      </div>
      {isClosed && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600 ring-1 ring-red-100">
          <AlertCircle className="h-4 w-4" />
          このレースは受付を終了しました。現在、馬券を購入することはできません。
        </div>
      )}

      <div className="flex flex-wrap gap-2 rounded-xl bg-gray-100 p-2">
        {BET_TYPE_ORDER.map((type) => (
          <Button
            key={type}
            type="button"
            onClick={() => handleBetTypeChange(type)}
            variant={betType === type ? 'primary' : 'ghost'}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              betType === type ? 'shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {BET_TYPE_LABELS[type]}
          </Button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="px-2 py-2 text-sm font-semibold">枠番</th>
              <th className="px-2 py-2 text-sm font-semibold">馬番</th>
              <th className="px-2 py-2 text-sm font-semibold">馬名</th>
              <th className="px-2 py-2 text-sm font-semibold">性齢</th>
              {columnLabels.map((label, i) => (
                <th key={i} className="px-2 py-2 text-center text-sm font-semibold">
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
                            className={`inline-flex h-6 w-6 items-center justify-center rounded text-sm font-semibold ${getBracketColor(Number(bracket))}`}
                          >
                            {bracket}
                          </span>
                        </td>
                      )}
                      <td className="px-2 py-2 text-sm font-semibold">{entry.horseNumber}</td>
                      <td className="px-2 py-2 text-sm font-semibold">{entry.horseName}</td>
                      <td className="px-2 py-2">
                        <Badge variant="gender" label={getGenderAge(entry.horseGender, entry.horseAge)} />
                      </td>
                      {idx === 0 &&
                        Array.from({ length: columnCount }).map((_, colIdx) => (
                          <td key={colIdx} className="px-2 text-center align-middle" rowSpan={bracketEntries.length}>
                            <input
                              type="checkbox"
                              checked={selections[colIdx].has(Number(bracket))}
                              onChange={() => handleCheckboxChange(colIdx, Number(bracket))}
                              disabled={isClosed || isPending}
                              className="text-primary focus:ring-primary h-5 w-5 cursor-pointer rounded border-gray-300 disabled:cursor-not-allowed disabled:opacity-30"
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
                        className={`inline-flex h-6 w-6 items-center justify-center rounded text-sm font-semibold ${getBracketColor(entry.bracketNumber!)}`}
                      >
                        {entry.bracketNumber}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-sm font-semibold">{entry.horseNumber}</td>
                    <td className="px-2 py-2 text-sm font-semibold">{entry.horseName}</td>
                    <td className="px-2 py-2">
                      <Badge variant="gender" label={getGenderAge(entry.horseGender, entry.horseAge)} />
                    </td>
                    {Array.from({ length: columnCount }).map((_, colIdx) => (
                      <td key={colIdx} className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={selections[colIdx].has(entry.horseNumber!)}
                          onChange={() => handleCheckboxChange(colIdx, entry.horseNumber!)}
                          disabled={isClosed || isPending}
                          className="text-primary focus:ring-primary h-5 w-5 cursor-pointer rounded border-gray-300 disabled:cursor-not-allowed disabled:opacity-30"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4 lg:flex lg:items-center lg:gap-8 lg:border-none lg:pb-0">
            <div className="flex flex-col gap-1 lg:items-start">
              <span className="text-sm font-semibold text-gray-500">購入点数</span>
              <span className="text-primary text-xl font-semibold">{betCount}点</span>
            </div>
            <div className="flex flex-col gap-1 lg:items-start">
              <span className="text-sm font-semibold text-gray-500">合計金額</span>
              <span className="text-xl font-semibold text-gray-900">{totalAmount.toLocaleString()}円</span>
            </div>
            <div className="col-span-2 flex flex-col gap-2 lg:col-auto lg:flex-row lg:items-center lg:gap-3">
              <label className="text-sm font-semibold text-gray-500">1点あたり</label>
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    value={amount / 100}
                    onChange={(e) => setAmount((parseInt(e.target.value, 10) || 0) * 100)}
                    disabled={isClosed || isPending}
                    className="w-24 pr-11 text-right font-semibold disabled:bg-gray-100"
                  />
                  <span className="pointer-events-none absolute right-3 text-sm font-semibold text-gray-400">00円</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowKeypad(!showKeypad)}
                  disabled={isClosed || isPending}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:bg-gray-50 hover:text-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  title="キーパッドで入力"
                >
                  <Calculator className="h-5 w-5" />
                </button>
                {showKeypad && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowKeypad(false)} />
                    <div className="absolute bottom-12 left-0 z-50">
                      <NumericKeypad
                        value={amount / 100}
                        onChange={(val: number) => setAmount(val * 100)}
                        onClose={() => setShowKeypad(false)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between lg:justify-end">
            <div className="flex flex-col items-center gap-1 sm:items-end">
              <span className="text-sm font-semibold text-gray-400">投票可能残高</span>
              <span className="text-sm font-semibold text-gray-600">{balance.toLocaleString()}円</span>
            </div>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isClosed || isPending || betCount === 0 || totalAmount > balance}
              className="h-12 w-full font-semibold sm:w-48"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  購入中...
                </>
              ) : (
                '購入確定'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
