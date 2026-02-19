# Paper Tipster: GitHub Copilot Custom Instructions

このリポジトリで GitHub Copilot がコード提案・修正を行う際の共通ルールです。
AI_CONTEXT.md をベースに、関連ドキュメントの重要事項を統合しています。

Source of Truth:

- 実装時の一次参照は `.github/copilot-instructions.md` と `.github/instructions/*.instructions.md`。

## 1. 基本方針

- 目的: Winning Post などのプレイデータを使い、Discordコミュニティで仮想競馬・馬券体験を提供する。
- 優先順位: 正確性 > 既存仕様整合性 > 保守性 > 開発速度。
- 既存仕様を尊重し、破壊的変更は避ける。
- 変更は最小差分で行い、無関係なリファクタや整形を混ぜない。

## 2. 必須ルール

- コメント禁止: ソースコードに `//` や `/* */` コメントを追加しない。
- ドキュメント・説明文は日本語で作成する。
- コマンドは必ず `task <command>` を使用する。
- ホスト環境で `pnpm` / `npm` / `yarn` を直接実行しない。
- パッケージマネージャは `pnpm` のみ使用する。
- Docker / docker compose 前提で開発・テスト・DB操作を行う。

## 3. アーキテクチャ

このプロジェクトは Feature-Sliced Design (FSD) 構成。

- `src/app`: ルーティング・ページ統合・レイアウト。
- `src/features`: ユーザー価値に直結する機能単位。
- `src/entities`: ドメインモデル・型・ドメインロジック。
- `src/shared`: 共通UI・設定・ユーティリティ・DB。

依存ルール:

- 上位レイヤーから下位レイヤーへの依存のみ許可。
- 下位から上位への逆依存は禁止。
- レイヤー間の密結合を避け、共通化が必要なら `shared` へ移す。

## 4. Next.js / 実装方針

- Next.js App Router を前提に実装する。
- 新規実装は Server Actions を優先し、API Route の追加は必要最小限にする。
- 認可が必要な処理は `requireAdmin` など既存ヘルパーで必ず保護する。
- UIはまず `src/shared/ui` の既存コンポーネントを再利用する。

## 5. DB・ドメイン実装ルール

- DBスキーマの正は `src/shared/db/schema.ts`。
- スキーマ変更時は既存の migration フロー (`task db:setup`) に合わせる。
- 金額は既存実装に合わせて整合的に扱う（ウォレット、取引履歴、配当計算）。
- `transaction` の種別と参照関係を壊さない。既存の `BET` / `PAYOUT` / `LOAN` などの意味を維持する。

BET5 / オッズの重要ルール:

- BET5は「5レース1着予想」のフォーメーション方式。
- BET5配当はプール方式（控除率 0% 前提）で、的中口数ベースで按分する。
- 的中者なし分の扱いは既存の carryover ロジックに合わせる。
- オッズ更新は既存の SSE と Redis スロットリング設計を尊重する。

## 6. UI/表示ルール

- 競馬用語を優先し、曖昧語を避ける（例: 「会場」ではなく「競馬場」）。
- レース情報の優先表示は「競馬場 → レース番号 → レース名 → グレード → 条件」。
- 日時表示はハイドレーション不整合を避ける（既存 `FormattedDate` や JST前提実装を優先）。
- 数値表示は locale 差異に注意し、既存方針（`ja-JP`）に合わせる。

## 7. リアルタイム同期 (SSE)

既存イベント契約を壊さないこと。

- `RACE_CLOSED`
- `RACE_REOPENED`
- `RACE_FINALIZED`
- `RACE_BROADCAST`
- `RACE_ODDS_UPDATED`

イベント名・ペイロード形式は既存クライアント実装との互換性を維持する。

## 8. テスト・品質ゲート

実装後は以下の順で確認する。

1. `task check`
2. `task test`
3. 必要時のみ `task test-full`

- 既存テスト方針（fast と full の分離）を尊重する。
- 不要なスナップショット更新や期待値変更をしない。

## 9. 変更提案のベストプラクティス

- まず関連ファイルを読み、既存パターンに合わせて変更する。
- 1つの修正目的に対して、影響範囲を明示して小さく実装する。
- 新規ファイル追加時は配置理由を FSD 観点で説明可能な構成にする。

## 10. スコープ別 instructions

作業対象に応じて、以下の instructions も参照する。

- `.github/instructions/frontend-ui.instructions.md`
- `.github/instructions/domain-betting.instructions.md`
- `.github/instructions/admin-operations.instructions.md`
- `.github/instructions/economy-wallet.instructions.md`
- `.github/instructions/realtime-sse.instructions.md`
- `.github/instructions/auth.instructions.md`
- `.github/instructions/ranking.instructions.md`
- `.github/instructions/forecasts.instructions.md`
- `.github/instructions/stats.instructions.md`
- `.github/instructions/user-profile.instructions.md`
- `.github/instructions/database-integrity.instructions.md`
