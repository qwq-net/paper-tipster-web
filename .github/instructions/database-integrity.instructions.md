---
applyTo: 'src/shared/db/**/*.ts,src/features/**/*.ts,src/entities/**/*.ts'
---

# Database Integrity 実装ルール

- DBスキーマの正は `src/shared/db/schema.ts`。
- schema/relation 変更時は既存 migration フロー（`task db:setup`）に従う。
- 既存 enum 値の意味を変更しない。必要なら追加で対応する。
- `transaction` は監査ログとして扱い、履歴の意味が変わる更新をしない。
- 外部キー・ユニーク制約の前提を壊す変更を避ける。

金額と整合:

- 金額は整数ベースの既存方針で扱う。
- 払戻・購入・借入は一貫したトランザクション境界で更新する。
- BET5 carryover と payout 計算の整合を保つ。

変更手順:

1. 先に schema と関連 query/action を読み、影響範囲を列挙する。
2. 最小差分で実装する。
3. `task check` → `task test`（必要時のみ `task test-full`）で検証する。
