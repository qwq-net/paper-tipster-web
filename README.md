# Paper Tipster

## 概要

Winning Post などのプレイデータをもとに、仲間内で仮想の競馬・馬券を楽しむためのWebアプリです。
設計には Feature-Sliced Design (FSD) を採用し、Next.js で構築しています。

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

- Docker と Docker Compose
- Node.js（ホスト側で実行する場合）

### 起動手順 (Docker)

1. 環境変数の設定
   `.env.sample` をコピーして `.env` を作成し、必要な値を設定してください。

2. 開発環境の起動

   ```bash
   task docker:up
   ```

   コンテナが起動し、Next.js アプリ、PostgreSQL、Redisが立ち上がります。

3. データベースのセットアップ
   初回起動時やリセット時は以下を実行します。
   ```bash
   task db:setup
   ```

- [AI向け開発コンテキスト](.github/copilot-instructions.md): プロジェクトに参加するAIエージェント/開発者向けの必読ドキュメント。

### 便利なコマンド

利用可能なコマンドは以下で確認できます。

```bash
task --list
```

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
   task docker:up:prod
   ```

   これにより、通常のサービス（app, db, redis）に加えて `tunnel` コンテナが起動します。

### ユーザーロール変更

ユーザーロールを変更する場合は、次のコマンドを使います。

```bash
task db:role
```

特定ユーザーを指定する場合は、次の形式で実行します。

```bash
task db:role -- --user=<username>
```

## ディレクトリ構成

本プロジェクトは **Feature-Sliced Design (FSD)** を採用しています。
詳細は [.github/copilot-instructions.md](.github/copilot-instructions.md) を参照してください。

- `src/app`: App Router Pages
- `src/features`: 機能モジュール (admin, auth, betting, economy, forecasts, ranking, stats, user)
- `src/entities`: ドメインモデル (bet, horse, race, ranking, user, wallet)
- `src/shared`: 共有コンポーネント・ユーティリティ・DB・設定

## 開発ルール

- [共通ルール](.github/copilot-instructions.md)
- [スコープ別ルール](.github/instructions)
