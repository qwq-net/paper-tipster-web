export function filterExacta(combinations: number[][]): number[][] {
  return combinations.filter((combo) => {
    const [a, b] = combo;
    return a !== b;
  });
}
