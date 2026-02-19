---
applyTo: 'src/features/ranking/**/*.ts,src/features/ranking/**/*.tsx,src/app/ranking/**/*.ts,src/app/ranking/**/*.tsx,src/app/@modal/(.)ranking/**/*.tsx'
---

# Ranking 実装ルール

- ランキング表示はイベントの `rankingDisplayMode` に従う。
- 表示モードの意味を変えない（`HIDDEN`, `ANONYMOUS`, `FULL`, `FULL_WITH_LOAN`）。
- 匿名公開時は自分以外の名前を秘匿する既存仕様を維持する。
- 借入表示は `FULL_WITH_LOAN` のときのみ表示する既存仕様を維持する。

データ整合:

- 集計対象はイベント単位で閉じる。別イベントの残高や取引を混在させない。
- 並び順・順位算出ロジックは既存実装と整合させ、同点時の挙動を不用意に変えない。

UI方針:

- 表示文言は日本語、数値フォーマットは `ja-JP` 方針に合わせる。
- モーダル表示（`@modal/(.)ranking`）と通常ページ表示で、同一データに対する表示差異を作らない。
