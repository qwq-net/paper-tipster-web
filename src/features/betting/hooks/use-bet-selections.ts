import { BET_TYPES, BetType, calculateBetCount } from '@/entities/bet';
import { getBetTypeColumnCount } from '@/features/betting/model/bet-types';
import { useState } from 'react';

interface Entry {
  bracketNumber: number | null;
}

interface UseBetSelectionsProps {
  entries: Entry[];
}

export function useBetSelections({ entries }: UseBetSelectionsProps) {
  const [betType, setBetType] = useState<BetType>(BET_TYPES.WIN);
  const [selections, setSelections] = useState<Set<number>[]>([new Set(), new Set(), new Set()]);
  const [amount, setAmount] = useState<number>(100);

  const columnCount = getBetTypeColumnCount(betType);

  const bracketHorseCount = new Map<number, number>();
  entries.forEach((entry) => {
    const bracket = entry.bracketNumber;
    if (bracket !== null) {
      bracketHorseCount.set(bracket, (bracketHorseCount.get(bracket) || 0) + 1);
    }
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

  const resetSelections = () => {
    setSelections([new Set(), new Set(), new Set()]);
    setAmount(100);
  };

  return {
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
  };
}
