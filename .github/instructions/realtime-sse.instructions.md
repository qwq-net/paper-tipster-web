---
applyTo: 'src/shared/lib/sse/**/*.ts,src/app/api/events/**/*.ts,src/features/**/*.ts,src/features/**/*.tsx'
---

# Realtime / SSE 実装ルール

- 既存イベント契約を壊さない。
- 許可イベント: `RACE_CLOSED`, `RACE_REOPENED`, `RACE_FINALIZED`, `RACE_BROADCAST`, `RACE_ODDS_UPDATED`。
- 既存クライアントが受信できるよう、イベント名・必須フィールド・型の後方互換性を維持する。

配信設計:

- EventEmitter のシングルトン前提を維持し、リクエストごとに別インスタンスを作らない。
- オッズ更新は既存の Redis スロットリング（leading/trailing）設計を尊重する。
- 高頻度更新時も最終状態が配信されることを優先し、通知抑制のみを目的に状態更新を省略しない。

UI連携:

- `RACE_CLOSED` 受信時は入力ロック、`RACE_REOPENED` で解除、`RACE_BROADCAST` で結果導線表示という既存挙動を前提に変更する。
