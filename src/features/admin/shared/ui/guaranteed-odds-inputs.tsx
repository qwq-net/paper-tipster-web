'use client';

import { DEFAULT_GUARANTEED_ODDS } from '@/shared/constants/odds';
import { Input, Label } from '@/shared/ui';
import { BET_TYPE_LABELS, BET_TYPES } from '@/types/betting';
import React from 'react';

interface GuaranteedOddsInputsProps {
  value: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
}

export function GuaranteedOddsInputs({ value, onChange }: GuaranteedOddsInputsProps) {
  const handleChange = (type: string, inputValue: string) => {
    const numValue = parseFloat(inputValue);
    const newValue = { ...value };
    if (isNaN(numValue)) {
      delete newValue[type];
    } else {
      newValue[type] = numValue;
    }
    onChange(newValue);
  };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Object.values(BET_TYPES).map((type) => (
        <div key={type} className="space-y-2">
          <Label htmlFor={`odds-${type}`}>{BET_TYPE_LABELS[type]}</Label>
          <Input
            id={`odds-${type}`}
            type="number"
            step="0.1"
            min="1.0"
            placeholder={DEFAULT_GUARANTEED_ODDS[type as keyof typeof DEFAULT_GUARANTEED_ODDS].toFixed(1)}
            value={value[type] || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(type, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
