import { calculatePayoutRate, Finisher, isWinningBet } from '@/shared/utils/payout';
import { BET_TYPES, BetDetail } from '@/types/betting';
import { describe, expect, it } from 'vitest';
import { calculateBetCount, getValidBetCombinations } from './index';

describe('Load Test (100 Users & Large Combinations)', () => {
  const fullBox18 = Array.from({ length: 18 }, (_, i) => i + 1);

  describe('Combination Calculation Performance', () => {
    it('3連単 18頭BOX (5,832 -> 4,896 combinations)', () => {
      const start = performance.now();
      const selections = [fullBox18, fullBox18, fullBox18];

      const count = calculateBetCount(selections, BET_TYPES.TRIFECTA);

      const combos = getValidBetCombinations(selections, BET_TYPES.TRIFECTA);
      const end = performance.now();

      const duration = end - start;
      console.log(`[TRIFECTA 18BOX] Time: ${duration.toFixed(2)}ms, Count: ${count}, Combos: ${combos.length}`);

      expect(count).toBe(4896);
      expect(combos.length).toBe(4896);

      expect(duration).toBeLessThan(100);
    });

    it('3連複 18頭BOX (5,832 -> 816 combinations)', () => {
      const start = performance.now();
      const selections = [fullBox18, fullBox18, fullBox18];

      const count = calculateBetCount(selections, BET_TYPES.TRIO);
      const combos = getValidBetCombinations(selections, BET_TYPES.TRIO);

      const end = performance.now();
      const duration = end - start;
      console.log(`[TRIO 18BOX] Time: ${duration.toFixed(2)}ms, Count: ${count}, Combos: ${combos.length}`);

      expect(count).toBe(816);
      expect(combos.length).toBe(816);
      expect(duration).toBeLessThan(50);
    });
  });

  describe('100 User Simulation (Winning Check & Payout)', () => {
    const finishers: Finisher[] = [
      { horseNumber: 1, bracketNumber: 1 },
      { horseNumber: 2, bracketNumber: 2 },
      { horseNumber: 3, bracketNumber: 3 },
    ];

    it('1,500 Bets Winning Check Performance', () => {
      const bets: BetDetail[] = [];
      for (let i = 0; i < 1500; i++) {
        if (i % 2 === 0) {
          bets.push({ type: BET_TYPES.TRIFECTA, selections: [1, 2, 3] });
        } else {
          bets.push({ type: BET_TYPES.TRIFECTA, selections: [1, 2, 4] });
        }
      }

      const start = performance.now();
      let hitCount = 0;
      for (const bet of bets) {
        if (isWinningBet(bet, finishers)) {
          hitCount++;
        }
      }
      const end = performance.now();
      const duration = end - start;

      console.log(`[1500 Bets Check] Time: ${duration.toFixed(2)}ms, Hits: ${hitCount}`);

      expect(hitCount).toBe(750);
      expect(duration).toBeLessThan(50);
    });

    it('Payout Rate Calculation Loop', () => {
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        calculatePayoutRate(1000000, 10000, 50000, 50, 0.2);
      }
      const end = performance.now();
      const duration = end - start;
      console.log(`[100 Payout Calcs] Time: ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(20);
    });
  });
});
