import { BetDetail, BetType } from '../constants';
import { isOrderSensitive } from './payout';

const ODDS_DEDUCTION_RATE = 0.2;

export interface OddsPool {
  poolByBetType: Record<string, number>;
  amountBySelection: Record<string, Record<string, number>>;
}

export function aggregateOddsPool(bets: { amount: number; details: BetDetail }[]): OddsPool {
  const poolByBetType: Record<string, number> = {};
  const amountBySelection: Record<string, Record<string, number>> = {};

  for (const bet of bets) {
    const details = bet.details as BetDetail;
    const betType = details.type as BetType;
    const key = JSON.stringify(
      isOrderSensitive(betType) ? details.selections : [...details.selections].sort((a, b) => a - b)
    );

    poolByBetType[betType] = (poolByBetType[betType] || 0) + bet.amount;
    if (!amountBySelection[betType]) amountBySelection[betType] = {};
    amountBySelection[betType][key] = (amountBySelection[betType][key] || 0) + bet.amount;
  }

  return { poolByBetType, amountBySelection };
}

export function calculateProvisionalOdds(
  pool: OddsPool,
  guaranteedOdds?: Record<string, number>
): Record<string, Record<string, number>> {
  const provisionalOdds: Record<string, Record<string, number>> = {};

  for (const [type, totalAmount] of Object.entries(pool.poolByBetType)) {
    provisionalOdds[type] = {};
    const selections = pool.amountBySelection[type];

    for (const [key, amount] of Object.entries(selections)) {
      if (amount === 0) continue;

      let rate = (totalAmount * (1 - ODDS_DEDUCTION_RATE)) / amount;
      rate = Math.floor(rate * 10) / 10;

      if (guaranteedOdds && guaranteedOdds[type]) {
        rate = Math.max(rate, guaranteedOdds[type]);
      }

      if (rate < 1.1) rate = 1.1;
      provisionalOdds[type][key] = rate;
    }
  }

  return provisionalOdds;
}

export function calculateWinOdds(winBets: { amount: number; details: BetDetail }[]): Record<string, number> {
  const winPool = winBets.reduce((sum, bet) => sum + bet.amount, 0);
  const winVotes: Record<string, number> = {};
  const winOdds: Record<string, number> = {};

  winBets.forEach((bet) => {
    const details = bet.details as BetDetail;
    const horseNumber = details.selections[0];
    if (horseNumber) {
      winVotes[horseNumber] = (winVotes[horseNumber] || 0) + bet.amount;
    }
  });

  const returnAmount = winPool * (1 - ODDS_DEDUCTION_RATE);

  Object.entries(winVotes).forEach(([horse, amount]) => {
    if (amount === 0) {
      winOdds[horse] = 0.0;
      return;
    }
    let odds = returnAmount / amount;
    odds = Math.floor(odds * 10) / 10;
    if (odds < 1.1) odds = 1.1;
    winOdds[horse] = odds;
  });

  return winOdds;
}
