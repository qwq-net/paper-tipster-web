import { BET_TYPES, BetDetail } from '@/types/betting';

export interface Finisher {
  horseNumber: number;
  bracketNumber: number;
}

/**
 * 票が的中しているか判定する
 * @param detail 購入内容
 * @param finishers 着順（1着、2着、3着...の順）
 */
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
      // 3着以内に入れば的中
      return finishers.slice(0, 3).some((f) => f.horseNumber === selections[0]);

    case BET_TYPES.QUINELLA:
      // 1-2着（順不同）
      return (
        f2 &&
        ((selections[0] === f1.horseNumber && selections[1] === f2.horseNumber) ||
          (selections[0] === f2.horseNumber && selections[1] === f1.horseNumber))
      );

    case BET_TYPES.EXACTA:
      // 1-2着（着順通り）
      return f2 && selections[0] === f1.horseNumber && selections[1] === f2.horseNumber;

    case BET_TYPES.WIDE: {
      // 1-2, 1-3, 2-3着のいずれか（順不同）
      if (!f2) return false;
      const top3 = finishers.slice(0, 3).map((f) => f.horseNumber);
      return selections.every((s) => top3.includes(s));
    }

    case BET_TYPES.BRACKET_QUINELLA:
      // 1-2着の枠番（順不同）
      return (
        f2 &&
        ((selections[0] === f1.bracketNumber && selections[1] === f2.bracketNumber) ||
          (selections[0] === f2.bracketNumber && selections[1] === f1.bracketNumber))
      );

    case BET_TYPES.TRIO: {
      // 1-3着（順不同）
      if (!f2 || !f3) return false;
      const top3 = finishers.slice(0, 3).map((f) => f.horseNumber);
      return selections.every((s) => top3.includes(s));
    }

    case BET_TYPES.TRIFECTA:
      // 1-3着（着順通り）
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

/**
 * 配当（オッズ）を計算する（パリミュチュエル方式）
 * @param totalPool その券種の総賭け金
 * @param winningAmount 総的中金額（賭け金の合計）
 * @param takeoutRate 控除率（0.0 〜 1.0）
 * @returns 払い戻し倍率（外れの場合は0）
 */
export function calculatePayoutRate(totalPool: number, winningAmount: number, takeoutRate: number = 0): number {
  if (winningAmount <= 0) return 0;
  const poolAfterTakeout = totalPool * (1 - takeoutRate);
  return poolAfterTakeout / winningAmount;
}
