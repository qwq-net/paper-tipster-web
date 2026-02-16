import { LOAN_THRESHOLD_RATIO } from '../constants';

export function calculateLoanThreshold(distributeAmount: number): number {
  return distributeAmount * LOAN_THRESHOLD_RATIO;
}

export function isEligibleForLoan(balance: number, distributeAmount: number, hasLoaned: boolean): boolean {
  if (hasLoaned) return false;
  const threshold = calculateLoanThreshold(distributeAmount);
  return balance < threshold;
}

export function calculateNetBalance(balance: number, totalLoaned: number): number {
  return balance - totalLoaned;
}
