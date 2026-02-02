import { BET_TYPES, BetDetail } from '@/types/betting';

export const TOKUBARAI_RATE = 0.7;

export interface Finisher {
  horseNumber: number;
  bracketNumber: number;
}

export function isWinningBet(detail: BetDetail, finishers: Finisher[]): boolean {
  const { type, selections } = detail;
  const f1 = finishers[0];
  const f2 = finishers[1];
  const f3 = finishers[2];

  if (!f1) return false;

  switch (type) {
    case BET_TYPES.WIN:
      return selections[0] === f1.horseNumber;

    case BET_TYPES.PLACE:
      return finishers.slice(0, 3).some((f) => f.horseNumber === selections[0]);

    case BET_TYPES.QUINELLA:
      return (
        f2 &&
        ((selections[0] === f1.horseNumber && selections[1] === f2.horseNumber) ||
          (selections[0] === f2.horseNumber && selections[1] === f1.horseNumber))
      );

    case BET_TYPES.EXACTA:
      return f2 && selections[0] === f1.horseNumber && selections[1] === f2.horseNumber;

    case BET_TYPES.WIDE: {
      if (!f2) return false;
      const top3 = finishers.slice(0, 3).map((f) => f.horseNumber);
      return selections.every((s) => top3.includes(s));
    }

    case BET_TYPES.BRACKET_QUINELLA:
      return (
        f2 &&
        ((selections[0] === f1.bracketNumber && selections[1] === f2.bracketNumber) ||
          (selections[0] === f2.bracketNumber && selections[1] === f1.bracketNumber))
      );

    case BET_TYPES.TRIO: {
      if (!f2 || !f3) return false;
      const top3 = finishers.slice(0, 3).map((f) => f.horseNumber);
      return selections.every((s) => top3.includes(s));
    }

    case BET_TYPES.TRIFECTA:
      return (
        f2 &&
        f3 &&
        selections[0] === f1.horseNumber &&
        selections[1] === f2.horseNumber &&
        selections[2] === f3.horseNumber
      );

    default:
      return false;
  }
}

export function calculatePayoutRate(
  totalPool: number,
  winningAmount: number,
  totalWinningAmount: number,
  winningCount: number = 1,
  takeoutRate: number = 0
): number {
  if (winningAmount <= 0) return 0;

  const netPool = totalPool * (1 - takeoutRate);

  let payoutPerUnit: number;

  if (winningCount > 1) {
    const profit = Math.max(0, netPool - totalWinningAmount);
    const dividedProfit = profit / winningCount;
    payoutPerUnit = (winningAmount + dividedProfit) / winningAmount;
  } else {
    payoutPerUnit = netPool / winningAmount;
  }

  const rate = Math.floor(payoutPerUnit * 10) / 10;
  return Math.max(1.0, rate);
}

export function getWinningCombinations(type: string, finishers: Finisher[]): number[][] {
  const f1 = finishers[0];
  const f2 = finishers[1];
  const f3 = finishers[2];

  if (!f1) return [];

  switch (type) {
    case 'win':
      return [[f1.horseNumber]];

    case 'place':
      return finishers.slice(0, 3).map((f) => [f.horseNumber]);

    case 'quinella':
      if (!f2) return [];
      return [[f1.horseNumber, f2.horseNumber].sort((a, b) => a - b)];

    case 'exacta':
      if (!f2) return [];
      return [[f1.horseNumber, f2.horseNumber]];

    case 'wide': {
      if (!f2) return [];
      const top3 = finishers.slice(0, 3).map((f) => f.horseNumber);
      const combos: number[][] = [];
      if (top3.length >= 2) {
        combos.push([top3[0], top3[1]].sort((a, b) => a - b));
      }
      if (top3.length >= 3) {
        combos.push([top3[0], top3[2]].sort((a, b) => a - b));
        combos.push([top3[1], top3[2]].sort((a, b) => a - b));
      }
      return combos;
    }

    case 'bracket_quinella':
      if (!f2) return [];
      return [[f1.bracketNumber, f2.bracketNumber].sort((a, b) => a - b)];

    case 'trio': {
      if (!f1 || !f2 || !f3) return [];
      return [[f1.horseNumber, f2.horseNumber, f3.horseNumber].sort((a, b) => a - b)];
    }

    case 'trifecta':
      if (!f1 || !f2 || !f3) return [];
      return [[f1.horseNumber, f2.horseNumber, f3.horseNumber]];

    default:
      return [];
  }
}
