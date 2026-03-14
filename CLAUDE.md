# Paper Tipster — Claude Code ガイド

## コマンドは必ず task 経由で実行する

このプロジェクトでは **Docker コンテナ内での実行を強制** しています。

`pnpm dev` / `pnpm build` / `pnpm test` をホスト上で直接実行すると、
意図的にエラーになります（`/.dockerenv` の有無で判定）。

```
Run via task instead:
  task dev / task build / task test
```

このエラーはバグではありません。必ず以下の task コマンドを使ってください。

| やりたいこと | コマンド |
|---|---|
| 開発サーバー起動 | `task docker:up` |
| テスト実行 | `task test` |
| フルテスト（重いテスト含む） | `task test:full` |
| ビルド | `task build` |
| Lint・型チェック | `task check` |
| 自動修正 | `task check:fix` |
| DB セットアップ | `task db:setup` |
| ログ確認 | `task docker:logs` |

利用可能なタスク一覧は `task` で確認できます。

## 基本方針

- 目的: Winning Post などのプレイデータを使い、Discord コミュニティで仮想競馬・馬券体験を提供する。
- 優先順位: 正確性 > 既存仕様整合性 > 保守性 > 開発速度。
- 既存仕様を尊重し、破壊的変更は避ける。
- 変更は最小差分で行い、無関係なリファクタや整形を混ぜない。

## 必須ルール

- ソースコードに `//` や `/* */` コメントを追加しない。
- ドキュメント・説明文は日本語で作成する。
- パッケージマネージャは `pnpm` のみ使用する。

## アーキテクチャ（FSD）

- `src/app`: ルーティング・ページ統合・レイアウト。
- `src/features`: ユーザー価値に直結する機能単位。
- `src/entities`: ドメインモデル・型・ドメインロジック。
- `src/shared`: 共通UI・設定・ユーティリティ・DB。

依存ルール: 上位レイヤーから下位レイヤーへの依存のみ許可。逆依存は禁止。

## Next.js 実装方針

- Next.js App Router を前提に実装する。
- 新規実装は Server Actions を優先し、API Route の追加は必要最小限にする。
- 認可が必要な処理は `requireAdmin` など既存ヘルパーで必ず保護する。
- UI はまず `src/shared/ui` の既存コンポーネントを再利用する。

## 変更手順

1. 関連ファイルを先に読み、既存パターンを把握する。
2. 最小差分で実装する。
3. `task check` → `task test`（必要時のみ `task test:full`）で確認する。

## スコープ別ルール

@.github/instructions/frontend-ui.instructions.md
@.github/instructions/domain-betting.instructions.md
@.github/instructions/admin-operations.instructions.md
@.github/instructions/economy-wallet.instructions.md
@.github/instructions/realtime-sse.instructions.md
@.github/instructions/auth.instructions.md
@.github/instructions/ranking.instructions.md
@.github/instructions/forecasts.instructions.md
@.github/instructions/stats.instructions.md
@.github/instructions/user-profile.instructions.md
@.github/instructions/database-integrity.instructions.md
