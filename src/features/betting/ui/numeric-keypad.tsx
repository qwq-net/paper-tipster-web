import { NumericInput } from '@/shared/ui';
import { Calculator, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NumericKeypadProps {
  value: number;
  onChange: (value: number) => void;
  onClose: () => void;
}

export function NumericKeypad({ value, onChange, onClose }: NumericKeypadProps) {
  const [currentValue, setCurrentValue] = useState(value);
  const [isPristine, setIsPristine] = useState(true);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleNumber = (n: number) => {
    let newValue: number;
    if (isPristine) {
      newValue = n;
      setIsPristine(false);
    } else {
      const valStr = currentValue === 0 ? '' : currentValue.toString();
      newValue = parseInt(`${valStr}${n}`, 10);
    }

    if (newValue < 1000000) {
      setCurrentValue(newValue);
    }
  };

  const handleClear = () => {
    setCurrentValue(0);
    setIsPristine(true);
  };

  const handleSubmit = () => {
    onChange(currentValue === 0 ? 100 : currentValue);
    onClose();
  };

  return (
    <div className="animate-in fade-in zoom-in w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl duration-200">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Calculator className="text-primary h-4 w-4" />
          <span>金額入力</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4">
        <div className="relative mb-4 flex items-center justify-end">
          <NumericInput
            value={currentValue}
            onChange={(val) => {
              setCurrentValue(val);
              setIsPristine(false);
            }}
            className="pr-12 text-right text-2xl font-semibold"
            min={0}
            max={999999}
          />
          <span className="pointer-events-none absolute right-4 text-lg font-semibold text-gray-400">00</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handleNumber(n)}
              className="flex h-12 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-xl font-semibold text-gray-900 transition-all hover:bg-gray-100 active:scale-95"
            >
              {n}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="flex h-12 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-95"
          >
            クリア
          </button>
          <button
            onClick={() => handleNumber(0)}
            className="flex h-12 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-xl font-semibold text-gray-900 transition-all hover:bg-gray-100 active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleSubmit}
            className="border-primary-hover bg-primary hover:bg-primary-hover flex h-12 items-center justify-center rounded-xl border text-sm font-semibold text-white transition-all active:scale-95"
          >
            決定
          </button>
        </div>
      </div>
    </div>
  );
}
