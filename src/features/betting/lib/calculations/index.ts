import { BET_TYPES, BetType } from '@/types/betting';
import { filterExacta } from './exacta';
import { filterBracketQuinella, filterQuinellaAndWide } from './quinella';
import { filterTrifecta } from './trifecta';
import { filterTrio } from './trio';

/**
 * Generate all possible combinations from the given selections (Cartesian product).
 * NOTE: This function assumes that the input `selections` are already deduplicated.
 */
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
      // WIN/PLACE should validation typically happen before this, but if called, just return as is.
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

/**
 * Helper to deduplicate selection arrays.
 */
function deduplicateSelections(selections: number[][]): number[][] {
  return selections.map((row) => Array.from(new Set(row)));
}

export function calculateBetCount(
  selections: number[][],
  betType: BetType,
  bracketHorseCount?: Map<number, number>
): number {
  // 1. Optimize for single-column bets (WIN, PLACE)
  if (betType === BET_TYPES.WIN || betType === BET_TYPES.PLACE) {
    if (selections.length === 0 || selections[0].length === 0) return 0;
    // Just count unique implementations in the first column
    return new Set(selections[0]).size;
  }

  // 2. Deduplicate inputs for multi-column bets
  const uniqueSelections = deduplicateSelections(selections);

  // 3. Generate and filter combinations
  const allCombos = generateCombinations(uniqueSelections);
  const validCombos = filterValidCombinations(allCombos, betType, bracketHorseCount);
  return validCombos.length;
}

export function getValidBetCombinations(
  selections: number[][],
  betType: BetType,
  bracketHorseCount?: Map<number, number>
): number[][] {
  // 1. Optimize for single-column bets (WIN, PLACE)
  if (betType === BET_TYPES.WIN || betType === BET_TYPES.PLACE) {
    if (selections.length === 0) return [];
    // Return each unique horse as a single-element array
    const distinct = Array.from(new Set(selections[0])).sort((a, b) => a - b);
    return distinct.map((num) => [num]);
  }

  // 2. Deduplicate inputs for multi-column bets
  const uniqueSelections = deduplicateSelections(selections);

  // 3. Generate and filter combinations
  const allCombos = generateCombinations(uniqueSelections);
  return filterValidCombinations(allCombos, betType, bracketHorseCount);
}
