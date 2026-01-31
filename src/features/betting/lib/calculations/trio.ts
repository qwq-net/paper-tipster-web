export function filterTrio(combinations: number[][]): number[][] {
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
