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

### Docker を使用する場合

1. `.env` ファイルを設定してください（Discord ID と Secret の設定が必須です）。
2. アプリケーションを起動します:

```bash
docker compose up
```

### ローカル開発

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認してください。

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
│   └── mypage/           # マイページ
├── entities/             # ビジネスエンティティ
├── features/             # 機能モジュール
│   ├── admin/            # 管理機能
│   │   ├── manage-entries/   # 出走馬管理機能
│   │   ├── manage-events/    # イベント管理機能
│   │   ├── manage-horses/    # 馬管理機能
│   │   ├── manage-races/     # レース管理機能
│   │   └── manage-users/     # ユーザー管理機能
│   ├── auth/             # 認証機能
│   └── economy/          # 経済機能
├── shared/               # 共通コンポーネント・ユーティリティ
│   ├── config/           # 設定（認証など）
│   ├── db/               # データベーススキーマ・接続
│   ├── ui/               # UIコンポーネント
│   └── utils/            # ユーティリティ関数
└── types/                # 型定義
```

## 環境変数

`.env` ファイルに以下を設定してください:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/webapp
AUTH_SECRET=your-secret-key
AUTH_DISCORD_ID=your-discord-client-id
AUTH_DISCORD_SECRET=your-discord-client-secret
```

## データベース

スキーマの変更後:

```bash
npx drizzle-kit push
```

## コード品質

TypeScriptチェックとフォーマット:

```bash
npx tsc --noEmit && npx prettier --write .
```
