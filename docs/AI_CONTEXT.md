# AI Development Context

このドキュメントは、本プロジェクト（Paper Tipster）に参加するAIエージェント、および新規開発者がプロジェクトの文脈、アーキテクチャ、ルールを素早く理解するためのものです。

## プロジェクトの目的

Winning Post等のプレイデータを元に、Discordコミュニティ内で仮想的な競馬・馬券遊びを行うためのWebアプリケーションです。
「手軽に」「リアルタイムに」「没入感のある」体験を提供することを目指しています。

## 基本ルール (Must Read)

- 本プロジェクトはコメント禁止です。 `//` や `/* */` 形式のコメントを残さないでください。
- ドキュメントは全て日本語で作成してください。計画時・タスク整理時も同様です。
- パッケージマネージャ: プロジェクトは `pnpm` で管理されています。`npm` や `yarn` ではなく、必ず `pnpm` を使用してください。
- Docker環境: 開発・テスト・DB操作は `docker` および `docker-compose` を前提としています。
- 権限エラー時: コマンドが権限エラー(Permission deniedなど)で失敗する場合、Dockerコンテナのユーザー権限やボリュームのマウント設定が影響している可能性があります。`sudo` を安易に使わず、まずはDocker環境の設定やコンテナの状態を調査してください。
- 困ったときは: まず `docs/` ディレクトリ内のドキュメント、または `README.md` を参照してください。仕様、設計、トラブルシューティングの多くはそこに記録されています。

## アーキテクチャと設計思想

### Feature-Sliced Design (FSD)

本プロジェクトは Feature-Sliced Design を採用しています。
ディレクトリ構造は `src/` 以下に階層化されています。

1.  `app`: Next.js App Routerのエントリーポイント。
2.  `features`: 機能単位のモジュール (例: `betting`, `admin`, `auth`)。ビジネスロジックはここに集約します。
    - API通信、UIコンポーネント、状態管理などが含まれます。
3.  `entities`: ドメインモデル (例: `User`, `Race`, `Horse`)。データベース定義や型定義が含まれます。
4.  `shared`: プロジェクト全体で共有される汎用的なコード (例: `ui` (Shadcn/UI), `utils`, `db`, `config`)。

重要なルール:

- 上位レイヤー (`app`) は下位レイヤー (`features`, `entities`, `shared`) をインポートできる。
- 下位レイヤーは上位レイヤーをインポートしてはいけない。
- 同一レイヤー内のモジュール間結合は避ける（必要なら `shared` に移動するか、上位で統合する）。

### 技術スタックのポイント

- Next.js 15+ (App Router): Server Actions を積極的に利用し、API Routes は最小限にします。
- Drizzle ORM: Type Safe なデータベース操作。スキーマ定義は `src/shared/db/schema.ts` にあります。
- データベースに関するドキュメントは `docs/DATABASE_DESIGN.md` です。
- Tailwind CSS v4: スタイリングに使用。`shared/ui` 配下のコンポーネントは Shadcn/UI ベースです。
- Docker: 開発環境の統一。テストやDB操作は基本的にDockerコンテナ経由で行います。

## 開発フローとコマンド

### 開発コマンド (Development Commands)

> [!IMPORTANT]
> **Dockerコンテナ内でのコマンド実行には、必ず以下の package.json スクリプトを使用してください。**
> 権限エラーを避けるため、ホストマシン上で直接 `pnpm install` や `pnpm dev` などを**実行しないでください**。
>
> - `pnpm p:install`: Dockerコンテナ内で `pnpm install` を実行
> - `pnpm p:dev`: Dockerコンテナ内で `pnpm dev` を実行
> - `pnpm p:build`: Dockerコンテナ内で `pnpm build` を実行
> - `pnpm p:add`: Dockerコンテナ内で `pnpm add` を実行

### 1. 環境構築

`.env` ファイルを設定し、以下を実行してDocker環境を立ち上げます。

```bash
pnpm d:up
```

### 2. データベース

スキーマ変更時は `src/shared/db/schema.ts` を編集し、マイグレーションを行います。

```bash
pnpm db:setup
```

### 3. テスト実行 (重要)

ローカル環境とDocker環境のバイナリ互換性（特にRollup/Linux）の問題を避けるため、テストはDockerコンテナ内で実行することを推奨します。

```bash
pnpm d:test
# または
docker compose exec app pnpm test
```

### 4. コード品質

コミット前に必ずLintと型チェックを通してください。

```bash
pnpm check      # ローカル環境のNode.jsで実行
pnpm d:check    # Dockerコンテナ内で実行 (推奨)
```

## 主要ディレクトリ/ファイル

- `src/shared/db/schema.ts`: データベーススキーマ定義（Single Source of Truth）。
- `src/types`: アプリケーション全体で使う型定義。
- `src/features/admin`: 管理者機能（レース登録、結果確定など）。
- `src/features/betting`: 馬券購入、オッズ計算ロジック。
- `src/app/(auth)`: 認証関連ページ。

## 注意事項 (Gotchas)

- Server Actions と Auth: `requireAdmin` などのヘルパーを使って権限チェックを行ってください。
- SSE (Server-Sent Events): リアルタイム更新（オッズ、レース結果）に使用しています。実績のある実装パターン（`src/lib/sse` 周辺）を参照してください。
- Lint/Formatter: プロジェクトには厳格なLintルール（コメント禁止など）があります。`pnpm lint:fix` や `sed` 等で対応してください。
