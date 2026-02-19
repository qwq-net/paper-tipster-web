---
applyTo: 'src/app/admin/**/*.ts,src/app/admin/**/*.tsx,src/features/admin/**/*.ts,src/features/admin/**/*.tsx'
---

# Admin Operations 実装ルール

- 管理者専用の変更は、既存の認可ヘルパー（`requireAdmin` など）で必ず保護する。
- 既存の運用フローを壊さない。特にレース進行は `SCHEDULED` → `CLOSED` → `FINALIZED` を基本とし、例外は `CANCELLED` とする。
- 着順確定と払戻確定は分離する。結果保存前に払戻配布を行わない。
- SSE連携を壊さない。管理操作に連動する既存イベント契約・通知タイミングを維持する。
- 管理UIは既存 `src/shared/ui` を優先再利用し、過剰な独自コンポーネントを増やさない。
- レース一覧・操作導線では、レース情報の優先順（競馬場 → レース番号 → レース名 → グレード → 条件）を維持する。

BET5 管理:

- BET5は5レース対象の前提を崩さない。
- 締切・払戻の実行可否は表示都合ではなく、DB上の状態で判定する。
- carryover / pot の扱いは既存ロジックに整合させる。
