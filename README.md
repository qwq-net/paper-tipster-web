# Paper Tipster

## 概要

Winning Post などのプレイデータをもとに、仲間内で仮想の競馬・馬券を楽しむためのWebアプリです。
設計には Feature-Sliced Design (FSD) を採用し、Next.js で構築しています。

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

### 開発環境でのCloudflare Tunnel利用 (外部公開)

家サーバーでの運用・スマートフォン実機での確認用に、開発環境でもCloudflare Tunnelを利用できます。
事前にCloudflare Zero Trustでトンネルを作成し、トークンを取得してください。

1. **環境変数の設定**
   `.env` ファイルに `TUNNEL_TOKEN` を設定してください。

2. **開発用プロファイルで起動**

   ```bash
   task docker:up:dev
   ```

   これにより、通常のサービス（app, db, redis）に加えて `tunnel-dev` コンテナが起動します。

3. **発行されたURLの確認**
   自身で設定したドメイン（例: `https://dev-tipstar.klbq.cc`）にアクセスしてください。
   トンネルが正常に稼働しているかログを確認する場合は以下を実行します。

   ```bash
   task docker:logs:tunnel
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

   ```bash
   task docker:up:prod
   ```

   これにより、通常のサービス（app, db, redis）に加えて `tunnel` コンテナが起動します。

### アーキテクチャメモ: Cloudflare環境下でのSSE (Server-Sent Events)

Cloudflareを経由する通信（Tunnel含む）において、HTTP接続で**100秒間無通信が続くと強制切断（HTTP 524）**される仕様があります。
本アプリケーションではリアルタイム通信にSSEを利用していますが、この制限を回避するため以下の対策を実装済みです。

1. **Keep-Alive Ping**: サーバー側（`src/app/api/events/race-status/route.ts`など）から約30秒間隔で `data: : ping` を送信。
2. **自動再接続**: クライアントフック（`use-sse.ts`）にて40秒以上Pingがない場合はソケットを破棄し、自動的に再接続を実行。

本番および開発のTunnel環境下において、SSE接続のタイムアウトが問題になる場合は、該当ファイルのパラメータ調整を検討してください。

## データベース操作関連

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
