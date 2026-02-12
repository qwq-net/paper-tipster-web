import { Button, NumericInput } from '@/shared/ui';
import { Calculator, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { NumericKeypad } from './numeric-keypad';

interface BetSummaryFooterProps {
  betCount: number;
  totalAmount: number;
  amount: number;
  balance: number;
  isClosed: boolean;
  isPending: boolean;
  onAmountChange: (amount: number) => void;
  onSubmit: () => void;
}

export function BetSummaryFooter({
  betCount,
  totalAmount,
  amount,
  balance,
  isClosed,
  isPending,
  onAmountChange,
  onSubmit,
}: BetSummaryFooterProps) {
  const [showKeypad, setShowKeypad] = useState(false);

  return (
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
                <NumericInput
                  value={amount / 100}
                  onChange={(val) => onAmountChange((val || 0) * 100)}
                  min={1}
                  max={999999}
                  disabled={isClosed || isPending}
                  className="w-28 pr-11 text-right font-semibold disabled:bg-gray-100"
                />
                <span className="pointer-events-none absolute right-3 text-sm font-semibold text-gray-400">00円</span>
              </div>
              <div className="relative">
                <Button
                  type="button"
                  onClick={() => setShowKeypad(!showKeypad)}
                  disabled={isClosed || isPending}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 text-gray-500 hover:text-blue-600"
                  title="キーパッドで入力"
                >
                  <Calculator className="h-5 w-5" />
                </Button>
                {showKeypad && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowKeypad(false)} />
                    <div className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2">
                      <NumericKeypad
                        value={amount / 100}
                        onChange={(val: number) => onAmountChange(val * 100)}
                        onClose={() => setShowKeypad(false)}
                      />
                    </div>
                  </>
                )}
              </div>
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
            onClick={onSubmit}
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
  );
}
