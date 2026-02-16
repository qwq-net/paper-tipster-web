'use client';

import { upsertForecast } from '@/features/forecasts/actions';

import { FORECAST_SYMBOLS } from '@/features/forecasts/constants';
import { ForecastSelection } from '@/features/forecasts/types';
import { Button, Textarea } from '@/shared/ui';
import { BracketBadge } from '@/shared/ui/bracket-badge';
import { cn } from '@/shared/utils/cn';
import { Loader2, Save } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

interface ForecastInputFormProps {
  raceId: string;
  entries: {
    id: string;
    horseId: string;
    horseNumber: number | null;
    horseName: string;
    bracketNumber: number | null;
  }[];
  initialForecast?: {
    selections: ForecastSelection;
    comment: string | null;
  } | null;
}

export function ForecastInputForm({ raceId, entries, initialForecast }: ForecastInputFormProps) {
  const [selections, setSelections] = useState<ForecastSelection>(initialForecast?.selections || {});
  const [comment, setComment] = useState(initialForecast?.comment || '');
  const [isPending, startTransition] = useTransition();

  const handleSymbolSelect = (horseId: string, symbol: string) => {
    setSelections((prev) => {
      const next = { ...prev };
      if (next[horseId] === symbol) {
        delete next[horseId];
      } else {
        next[horseId] = symbol;
      }
      return next;
    });
  };

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        await upsertForecast(raceId, selections, comment);
        toast.success('予想を保存しました');
      } catch (error) {
        console.error(error);
        toast.error('保存に失敗しました');
      }
    });
  };

  return (
    <div className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">予想入力</h2>
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="from-primary to-primary/80 hover:to-primary bg-linear-to-r shadow-md transition-all hover:shadow-lg active:scale-95"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          保存する
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">枠</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">馬番</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">馬名</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">印</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-3 py-2 text-sm text-gray-900">
                  <BracketBadge bracketNumber={entry.bracketNumber} />
                </td>
                <td className="px-3 py-2 text-sm text-gray-900">{entry.horseNumber}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{entry.horseName}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    {FORECAST_SYMBOLS.map((symbol) => (
                      <button
                        key={symbol}
                        onClick={() => handleSymbolSelect(entry.horseId!, symbol)}
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
                          selections[entry.horseId!] === symbol
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
          短評・コメント
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="レースの見解や推奨理由などを入力してください"
          className="w-full"
        />
      </div>
    </div>
  );
}
