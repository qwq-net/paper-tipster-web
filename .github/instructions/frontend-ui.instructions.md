---
applyTo: 'src/**/*.tsx,src/**/*.ts'
---

# Frontend / UI 実装ルール

- まず `src/shared/ui` の既存コンポーネントを再利用する。
- 競馬用語を使う。UI文言で「会場」は使わず「競馬場」を使う。
- レース情報は「競馬場 → レース番号 → レース名 → グレード → 条件」の順で優先表示する。
- 日時表示はハイドレーション不整合を避けるため、既存の `FormattedDate` と JST基準実装を優先する。
- 数値は locale 差異を避けるため `ja-JP` 方針に合わせる。
- ステータス表示は既存 `Badge` 変種と既存ユーティリティを優先する。

リアルタイム同期の互換性:

- SSEイベント名は既存契約を厳守する。
- `RACE_CLOSED` / `RACE_REOPENED` / `RACE_FINALIZED` / `RACE_BROADCAST` / `RACE_ODDS_UPDATED`
- クライアント側ハンドリング時は、イベント名・ペイロード形式の後方互換性を維持する。
