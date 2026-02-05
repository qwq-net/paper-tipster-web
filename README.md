# Paper Tipster

## 概要

Winning Post等のプレイデータを元に、仲間内で仮想的な競馬・馬券遊びを行うためのWebアプリケーションです。
Feature-Sliced Design (FSD) アーキテクチャを採用し、Next.js で構築されています。

## 主要機能

- **ユーザー**: Discordログイン、イベント参加、馬券購入（単勝〜3連単）、リアルタイム結果確認
- **管理者**: イベント・レース・馬の管理、レース進行（着順・配当確定）

## 技術スタック

- **Framework**: Next.js 15+ (App Router)
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Session**: Redis
- **Styling**: Tailwind CSS v4
- **Auth**: Auth.js (Discord OAuth)
- **Infrastructure**: Docker Compose

## 開発環境セットアップ

### 前提条件

- Docker & Docker Compose
- Node.js (ホスト側で実行する場合)

### 起動手順 (Docker)

1. 環境変数の設定
   `.env.example` をコピーして `.env` を作成し、必要な値を設定してください。

2. 開発環境の起動

   ```bash
   npm run d:up
   ```

   コンテナが起動し、Next.jsアプリ、PostgreSQL、Drizzle Studioが立ち上がります。

3. データベースのセットアップ
   初回起動時やリセット時は以下を実行します。
   ```bash
   npm run db:setup
   ```

### 便利なコマンド

`package.json` に定義されている主要なスクリプトです。

| コマンド              | 説明                                        |
| :-------------------- | :------------------------------------------ |
| `npm run dev`         | ローカルで開発サーバーを起動                |
| `npm run d:up`        | Docker環境を起動 (バックグラウンド)         |
| `npm run d:down`      | Docker環境を停止                            |
| `npm run d:restart`   | Docker環境を再起動                          |
| `npm run d:logs`      | Dockerコンテナのログを表示                  |
| `npm run d:clean`     | Docker環境を完全にリセット (Volume削除含む) |
| `npm run db:setup`    | DBスキーマの適用とシードデータの投入        |
| `npm run db:reset`    | DBのリセット                                |
| `npm run redis:reset` | Redisデータのリセット                       |
| `npm run check`       | 型チェックとフォーマッタの実行              |
| `npm test`            | テストの実行 (Vitest)                       |

### 管理者権限の設定

以下のコマンドで、Userテーブルの最初のユーザーにADMIN権限を付与します。

```
npm run db:admin
```

または、以下で指定したユーザーにADMIN権限を付与します。

```
npm run db:admin -- --user=<username>
```

## ディレクトリ構成

本プロジェクトは **Feature-Sliced Design (FSD)** を採用しています。
詳細は [docs/APPLICATION_DESIGN.md](docs/APPLICATION_DESIGN.md) を参照してください。

- `src/app`: App Router Pages
- `src/features`: 機能モジュール (Auth, Betting, Admin, Economy)
- `src/entities`: ドメインモデル (User, Horse, Race)
- `src/shared`: 共有コンポーネント・ユーティリティ

## ドキュメント

- [機能仕様書](docs/FUNCTIONAL_SPECIFICATION.md)
- [アプリケーション設計](docs/APPLICATION_DESIGN.md)
- [UI/UXガイドライン](docs/UI_UX_DESIGN.md)
- [UIコンポーネントガイド](docs/UI_COMPONENT_GUIDE.md)
- [データベース設計](docs/DATABASE_DESIGN.md)
- [馬券UI設計](docs/BETTING_UI_DESIGN.md)
