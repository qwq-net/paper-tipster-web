export function calculateBet5Count(selections: {
  race1: string[];
  race2: string[];
  race3: string[];
  race4: string[];
  race5: string[];
}): number {
  return (
    selections.race1.length *
    selections.race2.length *
    selections.race3.length *
    selections.race4.length *
    selections.race5.length
  );
}

export function calculateBet5Dividend(totalPot: number, winCount: number): number {
  if (winCount === 0) return 0;
  return Math.floor(totalPot / winCount);
}

export function isBet5Winner(
  ticketSelections: {
    race1: string[];
    race2: string[];
    race3: string[];
    race4: string[];
    race5: string[];
  },
  winners: string[]
): boolean {
  return (
    ticketSelections.race1.includes(winners[0]) &&
    ticketSelections.race2.includes(winners[1]) &&
    ticketSelections.race3.includes(winners[2]) &&
    ticketSelections.race4.includes(winners[3]) &&
    ticketSelections.race5.includes(winners[4])
  );
}
