---
applyTo: 'src/features/stats/**/*.ts,src/features/stats/**/*.tsx,src/app/stats/**/*.ts,src/app/stats/**/*.tsx'
---

# Stats 実装ルール

- 集計はイベント境界を厳守し、別イベントのデータを混在させない。
- 指標定義（勝率、回収率、的中率など）は既存計算式を変更しない。
- 比率計算のゼロ除算を必ず考慮する。
- 数値表示は `ja-JP` 方針に合わせ、表示丸めを既存実装と揃える。
- 画面描画は重い集計を避け、既存のクエリ層・集計層を再利用する。

品質:

- 既存テストの期待値意味を壊さない。
- 実装後は `task check` と `task test` を実行する（必要時のみ `task test-full`）。
