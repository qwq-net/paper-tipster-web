---
applyTo: 'src/features/forecasts/**/*.ts,src/features/forecasts/**/*.tsx'
---

# Forecasts 実装ルール

- 予想データはイベント・レースとの紐付け整合を最優先する。
- 表示や保存ロジックで、他イベントのデータが混在しないようにする。
- 予想入力UIは既存のフォームパターンと `src/shared/ui` を優先再利用する。
- リアルタイム更新と干渉する画面では、SSEイベント契約を壊さない。
- 文言は日本語、競馬用語を優先し、曖昧語を避ける。

品質:

- 既存のクエリ・型・バリデーションを流用し、独自仕様を追加しない。
- 実装後は `task check` と `task test` を実行する（必要時のみ `task test-full`）。
