# AI Development Context

このドキュメントは、Paper Tipster に参加するAIエージェントと新規開発者向けの案内です。
プロジェクトの背景、設計、開発ルールを短時間で把握できるようにまとめています。

## プロジェクトの目的

Winning Post などのプレイデータをもとに、Discordコミュニティで仮想の競馬・馬券遊びを行うWebアプリです。
「手軽に」「リアルタイムに」「没入感のある」体験を提供することを目指しています。

## 基本ルール (Must Read)

> [!IMPORTANT]
> 本プロジェクトはコメント禁止です。 `//` や `/* */` 形式のコメントを残さないでください。
> ドキュメントは全て日本語で作成してください。計画時・タスク整理時も同様です。
> コマンドはDockerコンテナ内で実行してください。

- パッケージマネージャ: 依存管理は `pnpm` です。`npm` や `yarn` は使わず、必ず `pnpm` を使ってください。
- Docker環境: 開発・テスト・DB操作は `docker` / `docker-compose` 前提です。

> [!IMPORTANT]
> すべてのコマンドは `task <command>` これで実行してください。
> 各コマンドは内部で `docker compose exec app ...` を実行するように構成されています。
> 権限エラーが発生し、生成が進まなくなるため _絶対に_ 忘れないようにしてください。

- 権限エラー時: `Permission denied` などが出る場合は、Dockerコンテナのユーザー権限やボリューム設定を確認してください。`sudo` は安易に使わないでください。
- 困ったときは: まず `docs/` と `README.md` を確認してください。仕様や設計、トラブル対応をまとめています。

## アーキテクチャと設計思想

### Feature-Sliced Design (FSD)

本プロジェクトは Feature-Sliced Design を採用しています。
コードは `src/` 配下でレイヤーごとに整理しています。

1.  `app`: Next.js App Routerのエントリーポイント。
2.  `features`: 機能単位のモジュール（例: `betting`, `admin`, `auth`）。ビジネスロジックをここに集約します。
    - API通信、UIコンポーネント、状態管理などを含みます。
3.  `entities`: ドメインモデル (例: `User`, `Race`, `Bet`)。ドメイン固有のロジック、型定義、定数が含まれます。
4.  `shared`: プロジェクト全体で共有される汎用的なコード (例: `ui` (Shadcn/UI), `utils`, `db`, `config`)。

重要なルール:

- 上位レイヤー（`app`）は下位レイヤー（`features`, `entities`, `shared`）をインポートできます。
- 下位レイヤーから上位レイヤーはインポートしません。
- 同一レイヤー内での密結合は避けます。必要なら `shared` へ移すか、上位で統合します。

### 技術スタックのポイント

- Next.js 16+（App Router）: Server Actions を中心に使い、API Routes は最小限にします。
- Drizzle ORM: 型安全なDB操作を行います。スキーマは `src/shared/db/schema.ts` です。
- DB関連ドキュメント: `docs/DATABASE_DESIGN.md`
- Tailwind CSS v4: スタイリングに使用します。`shared/ui` は Shadcn/UI ベースです。
- Docker: 開発環境を統一します。テストやDB操作は基本的に `task` 経由で実行します。

## 開発フローとコマンド

### 開発コマンド (Development Commands)

> [!IMPORTANT]
> **コマンド実行には、必ず以下の `task` コマンドを使用してください。**
> 権限エラーを避けるため、ホストマシン上で直接 `pnpm` などを**実行しないでください**。
>
> - `task install`: Dockerコンテナ内で `pnpm install` を実行
> - `task dev`: Dockerコンテナ内で `pnpm dev` を実行
> - `task build`: Dockerコンテナ内で `pnpm build` を実行
> - `task add`: Dockerコンテナ内で `pnpm add` を実行

### 1. 環境構築

`.env` ファイルを設定し、以下を実行してDocker環境を立ち上げます。

```bash
task docker:up
```

### 2. データベース

スキーマ変更時は `src/shared/db/schema.ts` を編集し、マイグレーションを行います。

```bash
task db:setup
```

### 3. テスト実行 (重要)

ローカル環境とDocker環境のバイナリ互換性（特にRollup/Linux）の問題を避けるため、テストはDockerコンテナ内で実行することを推奨します。

```bash
task test
```

### 4. コード品質

コミット前に、必ずLintと型チェックを通してください。

```bash
task check
```

## 主要ディレクトリ/ファイル

- `src/shared/db/schema.ts`: データベーススキーマ定義（Single Source of Truth）。
- `src/entities/bet`: 馬券ドメイン（型定義、組み合わせ定数、的中判定、配当計算）。
- `src/entities/race`: レースドメイン（ステータス管理ロジック）。
- `src/entities/user`: ユーザードメイン（ロール定義）。
- `src/features/admin`: 管理者機能（レース登録、結果確定など）。
- `src/features/betting`: 馬券購入、オッズ計算ロジック。
- `src/app/(auth)`: 認証関連ページ。

## 注意事項 (Gotchas)

- Server Actions と Auth: `requireAdmin` などのヘルパーで権限チェックを行ってください。
- SSE（Server-Sent Events）: オッズやレース結果のリアルタイム更新に使います。`src/shared/lib/sse` 周辺の実装を参考にしてください。
- Lint/Formatter: コメント禁止など、厳格なルールがあります。`task check` を実行して確認してください。
