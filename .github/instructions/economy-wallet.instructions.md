---
applyTo: 'src/features/economy/**/*.ts,src/features/economy/**/*.tsx,src/entities/wallet/**/*.ts,src/features/betting/**/*.ts,src/features/betting/**/*.tsx'
---

# Economy / Wallet 実装ルール

- ウォレットはイベント単位で独立管理する。イベントをまたいだ残高混在を作らない。
- 取引履歴（`transaction`）は監査ログとして扱い、意味の上書きや不整合を生む更新を避ける。
- 取引種別（`DISTRIBUTION`, `BET`, `PAYOUT`, `REFUND`, `ADJUSTMENT`, `LOAN`）の意味を維持する。
- 金額は既存方針の整数処理に合わせる。丸め方法や単位の変更は既存ロジックと整合させる。

ローン:

- 借入条件は既存仕様（残高しきい値・イベントごと1回）に合わせる。
- イベント個別の `loanAmount` が未設定の場合は `distributeAmount` を基準にする既存仕様を維持する。

BET / 払戻連携:

- 購入時の残高チェックと取引記録を必ず同一トランザクション整合で扱う。
- 払戻は的中判定・配当計算と取引記録を分離せず、一貫した更新単位で実装する。
- BET5関連の取引表示は、通常券種と混同しない既存の判別方針を維持する。
