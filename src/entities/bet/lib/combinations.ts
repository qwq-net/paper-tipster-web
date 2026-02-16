import { BET_TYPES, BetType } from '../constants';

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

function filterExacta(combinations: number[][]): number[][] {
  return combinations.filter((combo) => {
    const [a, b] = combo;
    return a !== b;
  });
}

function filterQuinellaAndWide(combinations: number[][]): number[][] {
  const seen = new Set<string>();
  return combinations.filter((combo) => {
    const [a, b] = combo;
    if (a === b) return false;

    const sorted = [a, b].sort((x, y) => x - y);
    const key = sorted.join('-');

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function filterBracketQuinella(combinations: number[][], bracketHorseCount?: Map<number, number>): number[][] {
  const seen = new Set<string>();
  return combinations.filter((combo) => {
    const [a, b] = combo;

    if (a === b) {
      const count = bracketHorseCount?.get(a) ?? 0;
      if (count < 2) return false;
    }

    const sorted = [a, b].sort((x, y) => x - y);
    const key = sorted.join('-');

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function filterTrifecta(combinations: number[][]): number[][] {
  return combinations.filter((combo) => {
    const [a, b, c] = combo;
    return a !== b && b !== c && a !== c;
  });
}

function filterTrio(combinations: number[][]): number[][] {
  const seen = new Set<string>();
  return combinations.filter((combo) => {
    const [a, b, c] = combo;
    if (a === b || b === c || a === c) return false;

    const sorted = [a, b, c].sort((x, y) => x - y);
    const key = sorted.join('-');

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
