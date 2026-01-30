# Japan Ranranru Racing Club

JRRAのWebアプリケーションです。

## 技術スタック

- **フレームワーク**: Next.js 15
- **言語**: TypeScript
- **スタイル**: Tailwind CSS v4
- **データベース**: PostgreSQL
- **ORM**: Drizzle ORM
- **認証**: Auth.js (NextAuth) with Discord Provider
- **インフラ**: Docker Compose

## 始め方

1.  Dockerがインストールされていることを確認してください。
2.  `.env` ファイルを設定してください（Discord ID と Secret の設定が必須です）。
3.  アプリケーションを起動します:

```bash
docker compose up
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認してください。

## プロジェクト構成

- `src/app`: App Router ページおよび API ルート
- `src/db`: データベーススキーマと接続設定
- `src/auth.ts`: 認証設定
