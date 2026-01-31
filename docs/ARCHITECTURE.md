# Feature-Sliced Design (FSD) Architecture Guide

このプロジェクトでは、フロントエンドのメンテナンス性と拡張性を高めるため、**Feature-Sliced Design (FSD)** というアーキテクチャパターンを採用しています。

## FSDの基本概念

FSDは、アプリケーションを「レイヤー（Layers）」、「スライス（Slices）」、「セグメント（Segments）」の3階層で分割・整理する設計手法です。
最も重要なルールは **「依存の方向は一方向（上位レイヤーから下位レイヤーへのみ依存可能）」** という点です。

### レイヤー構成（上から順に上位）

1.  **App (`src/app`)**: アプリケーションの初期化、ルーティング、グローバル設定。
    - _依存ルール_: すべての下位レイヤーを使用可能。
2.  **(Pages)**: Next.js App Routerでは `src/app` がこの役割を兼ねます。各ページごとの構成。
3.  **Widgets (`src/widgets`)**: 複数のFeatureやEntityを組み合わせた独立したUIブロック（例: Header, Sidebar）。
4.  **Features (`src/features`)**: ユーザーにとって価値のある**機能・アクション**（例: ログイン、いいね、カート追加）。
5.  **Entities (`src/entities`)**: ビジネスドメインの**データモデル・表示**（例: User, Product, Order）。
6.  **Shared (`src/shared`)**: 特定のドメインに依存しない共通コード（UIキット、APIクライアント、設定）。
    - _依存ルール_: どのレイヤーにも依存してはいけない（最下層）。

---

## 現在のディレクトリ構成の解説

このプロジェクトで採用している具体的な構成と、その意図（なぜそこに置いたか）を解説します。

### 1. `src/app` (App Layer & Pages Layer)

Next.jsのApp Router規約に基づくディレクトリです。FSDの「App」と「Pages」の役割を担います。

- **役割**: ルーティング定義、レイアウト、ページ全体の組み立て。
- **設計意図**: ここには「複雑なロジック」を書かず、下位レイヤー（Features/Entities）から部品をインポートして配置するだけに留めます。これにより、フレームワーク（Next.js）への依存をこの層だけに閉じ込めやすくなります。
- **例**: `layout.tsx`, `login/page.tsx`

### 2. `src/widgets` (Widgets Layer)

- **役割**: ページ内で使われる大きなUIブロック。
- **現状**: まだ空ですが、将来的に「ヘッダー（ロゴ＋ナビ＋ログアウトボタン）」のようなコンポーネントが出来たらここに配置します。

### 3. `src/features` (Features Layer)

- **役割**: **「ユーザーが実行するアクション」** を伴う機能モジュール。
- **配置したもの**:
  - **Auth**: `login-button`, `logout-button`
- **なぜここか？**: 「ログインする」「ログアウトする」というのは、単なる表示ではなく**機能（アクション）**だからです。ボタンの見た目だけでなく、クリック時の振る舞い（Server Action呼び出しなど）を含めてカプセル化します。

### 4. `src/entities` (Entities Layer)

- **役割**: ビジネスデータの**「表示」** やデータの型定義。
- **配置したもの**:
  - **User**: `user-profile`
- **なぜここか？**: 「ユーザー情報」はビジネスの中心となる実体（Entity）です。ここでは「ユーザーがどう表示されるか（UI）」や「ユーザーデータの型」を管理します。アクション（更新など）はFeatureに移譲することが多いですが、単なる表示はEntityの責務です。

### 5. `src/shared` (Shared Layer)

- **役割**: プロジェクト全体で使われる、再利用性の高い部品や設定。
- **配置したもの**:
  - `ui/button.tsx`: 特定の機能（ログインなど）に紐付かない、汎用的なボタン。
  - `config/auth.ts`: NextAuthの設定。これはアプリの「インフラ」設定なのでSharedです。
  - `db/*`: データベース接続。これもインフラ層なのでSharedです。
- **なぜここか？**: これらは `features/auth` や `entities/user` など、あらゆる場所から呼ばれる可能性があるため、最下層のSharedに置く必要があります。

---

## 具体的なコードの流れ（依存関係）

```
src/app/login/page.tsx (Page)
  ↓ imports
src/features/auth/index.ts (Feature)
  ↓ imports
src/shared/ui/button.tsx (Shared)
```

このように、常に **App -> Feature -> Shared** という一方向の流れを守ることで、コードがスパゲッティ化するのを防ぎます。
仮に `src/shared` から `src/features` をimportしようとすると、それはアーキテクチャ違反（循環参照の元）となります。
