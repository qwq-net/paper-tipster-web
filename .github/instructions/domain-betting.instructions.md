---
applyTo: 'src/features/betting/**/*.ts,src/features/betting/**/*.tsx,src/entities/bet/**/*.ts,src/shared/db/**/*.ts'
---

# Betting / DB ドメインルール

- DBスキーマの正は `src/shared/db/schema.ts`。テーブル・relationの意味を壊さない。
- `transaction` 種別 (`BET`, `PAYOUT`, `LOAN` など) の意味・参照関係を維持する。
- 金額計算は整数ベースの既存方針に合わせ、丸め規則を変更しない。

BET5:

- BET5は「5レース1着予想」のフォーメーション方式。
- 点数計算と購入金額は既存 `unitAmount` の流れを維持する。
- 配当はプール方式（控除率 0%）で、的中口数ベースに按分する。
- 的中者なし時は既存 carryover ロジックに合わせる。

オッズ:

- オッズ更新は既存 SSE + Redis スロットリング設計（leading/trailing）を尊重する。
- イベント配信契約や保存形式（`race_odds`）を破壊しない。

実装手順:

1. 関連ロジックと既存テストを先に読む。
2. 最小差分で変更する。
3. `task check` → `task test`（必要時のみ `task test-full`）で確認する。
