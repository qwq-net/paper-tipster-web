export function filterTrifecta(combinations: number[][]): number[][] {
  return combinations.filter((combo) => {
    const [a, b, c] = combo;
    return a !== b && b !== c && a !== c;
  });
}
