# Paper Tipster

## 概要

Winning Post等のプレイデータを元に、仲間内で仮想的な競馬・馬券遊びを行うためのWebアプリケーションです。
Feature-Sliced Design (FSD) アーキテクチャを採用し、Next.js で構築されています。

## 主要機能

- **ユーザー**: Discordログイン、イベント参加、馬券購入（単勝〜3連単）、BET5、借入（ローン）、リアルタイム結果確認
- **管理者**: クイックガイド、イベント・レース・馬の管理、レース進行（着順・配当確定）、保証オッズ設定、借入額設定

## 技術スタック

- **Framework**: Next.js 16+ (App Router)
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Session**: Redis
- **Styling**: Tailwind CSS v4
- **Auth**: Auth.js (Discord OAuth)
- **Testing**: Vitest
- **UI**: Radix UI, Lucide React, dnd-kit, sonner
- **Infrastructure**: Docker Compose

## 開発環境セットアップ

### 前提条件

- Docker & Docker Compose
- Node.js (ホスト側で実行する場合)

### 起動手順 (Docker)

1. 環境変数の設定
   `.env.sample` をコピーして `.env` を作成し、必要な値を設定してください。

2. 開発環境の起動

   ```bash
   task docker:up
   ```

   コンテナが起動し、Next.jsアプリ、PostgreSQL、Redisが立ち上がります。

3. データベースのセットアップ
   初回起動時やリセット時は以下を実行します。
   ```bash
   task db:setup
   ```

- [AI向け開発コンテキスト](docs/AI_CONTEXT.md): プロジェクトに参加するAIエージェント/開発者向けの必読ドキュメント。

### 便利なコマンド

`Taskfile.yml` に定義されている主要なコマンドです。 `task <command>` で実行します。

| コマンド            | 説明                                        |
| :------------------ | :------------------------------------------ |
| `task dev`          | 開発サーバーを起動                          |
| `task docker:up`    | Docker環境を起動 (バックグラウンド)         |
| `task docker:down`  | Docker環境を停止                            |
| `task docker:build` | Docker環境をビルドして起動                  |
| `task docker:clean` | Docker環境を完全にリセット (Volume削除含む) |
| `task install`      | 依存関係のインストール                      |
| `task build`        | アプリケーションをビルド                    |
| `task test`         | テストを実行                                |
| `task check`        | 型チェック・フォーマットチェックを実行      |
| `task db:setup`     | DBスキーマの適用とシードデータの投入        |
| `task db:seed`      | シードデータの投入                          |
| `task db:reset`     | DBのリセット                                |
| `task redis:reset`  | Redisのリセット                             |
| `task lint`         | ESLintを実行                                |
| `task format`       | Prettierを実行                              |

## シードデータ

マスタデータ（競馬場、レース定義、馬マスタ）は以下のJSONファイルで管理されています。
データを追加・変更した後は `task db:seed` を実行することで反映されます。

- `src/shared/db/seeds/venues.json`: 競馬場マスタ
- `src/shared/db/seeds/races.json`: レース定義マスタ
- `src/shared/db/seeds/horses.json`: 馬マスタ（実在・架空・勝ち鞍データ）

## 本番環境での実行

本番環境で Cloudflare Tunnel を含めて起動する場合は、以下の手順で行います。

1. **環境変数の設定**
   `.env` ファイルに `TUNNEL_TOKEN` を設定してください。

2. **プロファイルを指定して起動**
   Docker Profiles 機能を使用して、`prod` プロファイルを有効にします。

   ```bash
   docker compose --profile prod up -d
   ```

   これにより、通常のサービス（app, db, redis）に加えて `tunnel` コンテナが起動します。

```
task db:role
```

または、以下で指定したユーザーの権限を変更します。

```
task db:role -- --user=<username>
```

## ディレクトリ構成

本プロジェクトは **Feature-Sliced Design (FSD)** を採用しています。
詳細は [docs/APPLICATION_DESIGN.md](docs/APPLICATION_DESIGN.md) を参照してください。

- `src/app`: App Router Pages
- `src/features`: 機能モジュール (admin, auth, betting, economy, race, ranking, user)
- `src/entities`: ドメインモデル (user)
- `src/shared`: 共有コンポーネント・ユーティリティ・DB
- `src/lib`: ライブラリ設定
- `src/types`: 型定義

## ドキュメント

- [機能仕様書](docs/FUNCTIONAL_SPECIFICATION.md)
- [アプリケーション設計](docs/APPLICATION_DESIGN.md)
- [UI/UXガイドライン](docs/UI_UX_DESIGN.md)
- [UIコンポーネントガイド](docs/UI_COMPONENT_GUIDE.md)
- [データベース設計](docs/DATABASE_DESIGN.md)
- [馬券UI設計](docs/BETTING_UI_DESIGN.md)
- [オッズシステム仕様](docs/ODDS_SYSTEM.md)
