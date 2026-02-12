import { describe, expect, it } from 'vitest';
import { calculateLoanThreshold, calculateNetBalance, isEligibleForLoan } from './logic';

describe('Loan Logic', () => {
  describe('calculateLoanThreshold', () => {
    it('should return 60% of distributeAmount', () => {
      expect(calculateLoanThreshold(10000)).toBe(6000);
      expect(calculateLoanThreshold(0)).toBe(0);
      expect(calculateLoanThreshold(5000)).toBe(3000);
    });
  });

  describe('isEligibleForLoan', () => {
    const distributeAmount = 10000;

    it('should return true if balance is below threshold and has not loaned yet', () => {
      expect(isEligibleForLoan(5999, distributeAmount, false)).toBe(true);
      expect(isEligibleForLoan(0, distributeAmount, false)).toBe(true);
    });

    it('should return false if balance is at or above threshold', () => {
      expect(isEligibleForLoan(6000, distributeAmount, false)).toBe(false);
      expect(isEligibleForLoan(10000, distributeAmount, false)).toBe(false);
    });

    it('should return false if already loaned, regardless of balance', () => {
      expect(isEligibleForLoan(1000, distributeAmount, true)).toBe(false);
      expect(isEligibleForLoan(7000, distributeAmount, true)).toBe(false);
    });
  });

  describe('calculateNetBalance', () => {
    it('should calculate balance minus total loaned', () => {
      expect(calculateNetBalance(5000, 10000)).toBe(-5000);
      expect(calculateNetBalance(20000, 10000)).toBe(10000);
      expect(calculateNetBalance(10000, 0)).toBe(10000);
    });
  });
});
