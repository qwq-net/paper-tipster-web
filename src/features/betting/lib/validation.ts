export function validateBetSubmission(
  betCount: number,
  amount: number,
  totalAmount: number,
  balance: number
): string | null {
  if (betCount === 0) {
    return '馬を選択してください';
  }

  if (amount < 100) {
    return '100円以上で入力してください';
  }

  if (totalAmount > balance) {
    return '残高が不足しています';
  }

  return null;
}
