# Japan Ranranru Racing Association

JRRAのWebアプリケーションです。

## 必要環境

- **Node.js**: 20.x (LTS)
- **Docker** / **Docker Compose**

## 技術スタック

- **フレームワーク**: Next.js 16
- **言語**: TypeScript 5
- **スタイル**: Tailwind CSS v4
- **データベース**: PostgreSQL
- **ORM**: Drizzle ORM
- **認証**: Auth.js (NextAuth) with Discord Provider
- **ドラッグ&ドロップ**: @dnd-kit
- **アイコン**: Lucide React

## 始め方

### 1. 環境変数の設定

`.env` ファイルを作成し、設定を行ってください。

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/webapp
AUTH_SECRET=your-secret-key
AUTH_DISCORD_ID=your-discord-client-id
AUTH_DISCORD_SECRET=your-discord-client-secret
```

> [!NOTE]
> ホストOS（Mac/Windows/Linux）のターミナルから `npm run db:*` 系のコマンドを実行する場合は、ホスト名に `localhost` を指定してください。

### 2. アプリケーションの起動 (Docker)

```bash
docker compose up -d
```

### 3. データベースの初期化

初回起動時やデータをリセットしたい時に実行します。

```bash
npm run db:setup
```

---

## 開発コマンド

### データベース管理

| コマンド               | 説明                                                       |
| :--------------------- | :--------------------------------------------------------- |
| `npm run db:setup`     | 全データの削除と初期データ（シード）の投入を一括で行います |
| `npm run db:reset`     | すべてのテーブルのデータを消去（Truncate）します           |
| `npm run db:seed`      | シードデータを投入します                                   |
| `npm run db:admin`     | 最初のユーザーに管理者（ADMIN）権限を付与します            |
| `npx drizzle-kit push` | スキーマの変更をDBに反映します                             |

### Docker 運用

Docker コンテナ内の環境を操作するためのショートカットです。

| コマンド                         | 説明                                                 |
| :------------------------------- | :--------------------------------------------------- |
| `npm run d:install -- [package]` | コンテナ内にパッケージを即座にインストールします     |
| `npm run d:logs`                 | コンテナのログをリアルタイムで表示します             |
| `npm run d:up`                   | コンテナを起動（バックグラウンド）                   |
| `npm run d:build`                | Dockerfile をビルドして起動                          |
| `npm run d:restart`              | コンテナを再起動                                     |
| `npm run d:clean`                | 依存関係やボリュームを全削除してクリーンビルドします |

> [!TIP]
> **開発体験（DX）向上のための最適化済み：**
>
> - **自動パッケージ同期**: ホストOS（Linux）とコンテナ間で `node_modules` が共有されています。ホスト側で `npm install` するだけでコンテナ内にも反映されます。
> - **起動時自動インストール**: `npm run d:up` や `d:restart` を行うたびに、コンテナ内で不足しているパッケージを自動でチェック・インストールします。
> - **DB 起動待ち**: データベースが完全に準備（Ready）できるまでアプリの起動を自動的に待機します。

---

## プロジェクト構成

FSD (Feature-Sliced Design) アーキテクチャを採用しています。

```
src/
├── app/                  # Next.js App Router (ページ・APIルート)
│   ├── admin/            # 管理画面
│   │   ├── entries/      # 出走馬管理
│   │   ├── events/       # イベント管理
│   │   ├── horses/       # 馬管理
│   │   ├── races/        # レース管理
│   │   └── users/        # ユーザー管理
│   ├── login/            # ログインページ
├── entities/             # ビジネスエンティティ（Userなど）
├── features/             # 機能モジュール
│   ├── admin/            # 管理機能 (Events, Horses, Races, Entries)
│   ├── auth/             # 認証機能
│   └── economy/          # 経済機能
├── shared/               # 共通コンポーネント・ユーティリティ・DB
└── types/                # グローバル型定義
```

## コード品質

型チェックとフォーマットを一括で実行します。コミット前の確認に推奨します。

```bash
npm run check
```
