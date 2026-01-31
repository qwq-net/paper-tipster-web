export function filterQuinellaAndWide(combinations: number[][]): number[][] {
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

export function filterBracketQuinella(combinations: number[][], bracketHorseCount?: Map<number, number>): number[][] {
  const seen = new Set<string>();
  return combinations.filter((combo) => {
    const [a, b] = combo;

    if (a === b) {
      const count = bracketHorseCount?.get(a) ?? 0;
      if (count < 2) return false;
    }

    const sorted = [a, b].sort((x, y) => x - y);
    const key = sorted.join('-');

    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
