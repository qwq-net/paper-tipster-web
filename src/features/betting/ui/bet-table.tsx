'use client';

import { BET_TYPES, getValidBetCombinations } from '@/entities/bet';
import { useRaceOdds as useRaceOddsData } from '@/features/betting';
import { fetchRaceOdds, placeBets } from '@/features/betting/actions';
import { useBetSelections } from '@/features/betting/hooks/use-bet-selections';
import { useRaceTimer } from '@/features/betting/hooks/use-race-timer';
import { validateBetSubmission } from '@/features/betting/lib/validation';
import { getBetTypeColumnLabels } from '@/features/betting/model/bet-types';
import { BetSummaryFooter } from '@/features/betting/ui/bet-summary-footer';
import { BetTypeSelector } from '@/features/betting/ui/bet-type-selector';
import { useSSE } from '@/shared/hooks/use-sse';
import { Badge, Checkbox, LiveConnectionStatus } from '@/shared/ui';
import { BracketBadge } from '@/shared/ui/bracket-badge';
import { FormattedDate } from '@/shared/ui/formatted-date';
import { getGenderAge } from '@/shared/utils/gender';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
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
  initialStatus: string;
  closingAt: string | null;
  initialOdds: Awaited<ReturnType<typeof fetchRaceOdds>>;
}

export function BetTable({ raceId, walletId, balance, entries, initialStatus, closingAt, initialOdds }: BetTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { isClosed, handleSSEMessage } = useRaceTimer({
    raceId,
    initialStatus,
    closingAt,
  });

  const { connectionStatus } = useSSE({
    url: '/api/events/race-status',
    onMessage: handleSSEMessage,
  });

  const odds = useRaceOddsData(raceId, initialOdds);

  const {
    betType,
    selections,
    amount,
    setAmount,
    betCount,
    totalAmount,
    columnCount,
    bracketHorseCount,
    selectionsArray,
    handleBetTypeChange,
    handleCheckboxChange,
    resetSelections,
  } = useBetSelections({ entries });

  const columnLabels = getBetTypeColumnLabels(betType);

  const handleSubmit = async () => {
    const error = validateBetSubmission(betCount, amount, totalAmount, balance);
    if (error) {
      toast.error(error);
      return;
    }

    const validCombinations = getValidBetCombinations(selectionsArray, betType, bracketHorseCount);

    startTransition(async () => {
      try {
        await placeBets({
          raceId,
          walletId,
          betType,
          combinations: validCombinations,
          amountPerBet: amount,
        });
        toast.success(`${totalAmount.toLocaleString()}円分の馬券を購入しました`);
        resetSelections();
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

  if (entries.length === 0) {
    return (
      <div className="space-y-6">
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 shadow-lg backdrop-blur-sm">
          <LiveConnectionStatus status={connectionStatus} showText={true} className="text-white" />
        </div>
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-gray-200 bg-gray-50 py-16 text-center">
          <div className="rounded-full bg-gray-100 p-3">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900">出走馬が登録されていません</h3>
            <p className="text-sm text-gray-500">
              このレースの出走馬データはまだ登録されていません。
              <br />
              データが登録されるまでお待ちください。
            </p>
          </div>
        </div>
      </div>
    );
  }

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

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <BetTypeSelector betType={betType} onBetTypeChange={handleBetTypeChange} />
        {odds?.updatedAt && (
          <span className="w-full text-right text-sm text-gray-500 sm:w-auto">
            オッズ最終更新:{' '}
            <FormattedDate date={odds.updatedAt} options={{ hour: '2-digit', minute: '2-digit', second: '2-digit' }} />
          </span>
        )}
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="px-2 py-2 text-sm font-semibold">枠番</th>
              <th className="px-2 py-2 text-sm font-semibold">馬番</th>
              <th className="px-2 py-2 text-sm font-semibold">馬名</th>
              <th className="px-2 py-2 text-sm font-semibold">性齢</th>
              <th className="px-2 py-2 text-center text-sm font-semibold">単勝オッズ</th>
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
                          <BracketBadge bracketNumber={Number(bracket)} />
                        </td>
                      )}
                      <td className="px-2 py-2 text-sm font-semibold">{entry.horseNumber}</td>
                      <td className="px-2 py-2 text-sm font-semibold">{entry.horseName}</td>
                      <td className="px-2 py-2">
                        <Badge variant="gender" label={getGenderAge(entry.horseGender, entry.horseAge)} />
                      </td>
                      <td className="px-2 py-2 text-center text-sm font-medium">
                        {odds?.winOdds?.[entry.horseNumber!]?.toFixed(1) ?? '-.-'}
                      </td>

                      {idx === 0 &&
                        Array.from({ length: columnCount }).map((_, colIdx) => (
                          <td key={colIdx} className="px-2 text-center align-middle" rowSpan={bracketEntries.length}>
                            <Checkbox
                              checked={selections[colIdx].has(Number(bracket))}
                              onCheckedChange={() => handleCheckboxChange(colIdx, Number(bracket))}
                              disabled={isClosed || isPending}
                              className="data-[state=checked]:border-primary data-[state=checked]:bg-primary h-5 w-5"
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
                      <BracketBadge bracketNumber={entry.bracketNumber} />
                    </td>
                    <td className="px-2 py-2 text-sm font-semibold">{entry.horseNumber}</td>
                    <td className="px-2 py-2 text-sm font-semibold">{entry.horseName}</td>
                    <td className="px-2 py-2">
                      <Badge variant="gender" label={getGenderAge(entry.horseGender, entry.horseAge)} />
                    </td>
                    <td className="px-2 py-2 text-center text-sm font-medium">
                      {odds?.winOdds?.[entry.horseNumber!]?.toFixed(1) ?? '-.-'}
                    </td>

                    {Array.from({ length: columnCount }).map((_, colIdx) => (
                      <td key={colIdx} className="px-2 py-2 text-center">
                        <Checkbox
                          checked={selections[colIdx].has(entry.horseNumber!)}
                          onCheckedChange={() => handleCheckboxChange(colIdx, entry.horseNumber!)}
                          disabled={isClosed || isPending}
                          className="data-[state=checked]:border-primary data-[state=checked]:bg-primary h-5 w-5"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <BetSummaryFooter
        betCount={betCount}
        totalAmount={totalAmount}
        amount={amount}
        balance={balance}
        isClosed={isClosed}
        isPending={isPending}
        onAmountChange={setAmount}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
