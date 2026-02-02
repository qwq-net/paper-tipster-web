import { BET_TYPES, BetType } from '@/types/betting';
import { filterExacta } from './exacta';
import { filterBracketQuinella, filterQuinellaAndWide } from './quinella';
import { filterTrifecta } from './trifecta';
import { filterTrio } from './trio';

export function generateCombinations(selections: number[][]): number[][] {
  if (selections.length === 0) return [];
  if (selections.some((s) => s.length === 0)) return [];

  const result: number[][] = [];

  function backtrack(index: number, current: number[]) {
    if (index === selections.length) {
      result.push([...current]);
      return;
    }
    for (const num of selections[index]) {
      current.push(num);
      backtrack(index + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  return result;
}

export function filterValidCombinations(
  combinations: number[][],
  betType: BetType,
  bracketHorseCount?: Map<number, number>
): number[][] {
  switch (betType) {
    case BET_TYPES.WIN:
    case BET_TYPES.PLACE:
      return combinations;

    case BET_TYPES.QUINELLA:
    case BET_TYPES.WIDE:
      return filterQuinellaAndWide(combinations);

    case BET_TYPES.BRACKET_QUINELLA:
      return filterBracketQuinella(combinations, bracketHorseCount);

    case BET_TYPES.EXACTA:
      return filterExacta(combinations);

    case BET_TYPES.TRIFECTA:
      return filterTrifecta(combinations);

    case BET_TYPES.TRIO:
      return filterTrio(combinations);

    default:
      return combinations;
  }
}

function deduplicateSelections(selections: number[][]): number[][] {
  return selections.map((row) => Array.from(new Set(row)));
}

export function calculateBetCount(
  selections: number[][],
  betType: BetType,
  bracketHorseCount?: Map<number, number>
): number {
  if (betType === BET_TYPES.WIN || betType === BET_TYPES.PLACE) {
    if (selections.length === 0 || selections[0].length === 0) return 0;

    return new Set(selections[0]).size;
  }

  const uniqueSelections = deduplicateSelections(selections);

  const allCombos = generateCombinations(uniqueSelections);
  const validCombos = filterValidCombinations(allCombos, betType, bracketHorseCount);
  return validCombos.length;
}

export function getValidBetCombinations(
  selections: number[][],
  betType: BetType,
  bracketHorseCount?: Map<number, number>
): number[][] {
  if (betType === BET_TYPES.WIN || betType === BET_TYPES.PLACE) {
    if (selections.length === 0) return [];

    const distinct = Array.from(new Set(selections[0])).sort((a, b) => a - b);
    return distinct.map((num) => [num]);
  }

  const uniqueSelections = deduplicateSelections(selections);

  const allCombos = generateCombinations(uniqueSelections);
  return filterValidCombinations(allCombos, betType, bracketHorseCount);
}
