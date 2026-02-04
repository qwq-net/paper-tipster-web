'use client';

import { Calculator, X } from 'lucide-react';
import { useState } from 'react';

interface NumericKeypadProps {
  value: number;
  onChange: (value: number) => void;
  onClose: () => void;
}

export function NumericKeypad({ value, onChange, onClose }: NumericKeypadProps) {
  const [isPristine, setIsPristine] = useState(true);

  const handleNumber = (n: number) => {
    let newValue: number;
    if (isPristine) {
      newValue = n;
      setIsPristine(false);
    } else {
      const valStr = value === 0 ? '' : value.toString();
      newValue = parseInt(`${valStr}${n}`, 10);
    }

    if (newValue < 1000000) {
      onChange(newValue);
    }
  };

  const handleClear = () => {
    onChange(1);
    setIsPristine(true);
  };

  return (
    <div className="animate-in fade-in zoom-in w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white duration-200">
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

      <div className="p-3">
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
            onClick={onClose}
            className="border-primary-hover bg-primary hover:bg-primary-hover flex h-12 items-center justify-center rounded-xl border text-sm font-semibold text-white transition-all active:scale-95"
          >
            決定
          </button>
        </div>
      </div>
    </div>
  );
}
