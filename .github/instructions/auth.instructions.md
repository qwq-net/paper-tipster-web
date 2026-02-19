---
applyTo: 'src/features/auth/**/*.ts,src/features/auth/**/*.tsx,src/app/(auth)/**/*.ts,src/app/(auth)/**/*.tsx,src/app/login/**/*.tsx,src/app/logout/**/*.tsx'
---

# Auth 実装ルール

- 認証方式は既存の Auth.js（Discord OAuth + ゲストコード方式）を前提に拡張する。
- ゲスト認証フロー（コード・ユーザー名・絵文字パスワード）の仕様を崩さない。
- ユーザー識別は既存の一意性ルール（ユーザー名重複不可）を維持する。
- `GUEST` / `USER` / `ADMIN` などのロール定義と既存権限制御を変更しない。
- 凍結済みユーザー（`disabledAt`）の扱いは既存ログイン制御に合わせる。

実装方針:

- 認証関連の表示・フォームは既存 `src/shared/ui` を優先再利用する。
- 入力バリデーションとエラー文言は日本語で統一し、既存トーンに合わせる。
- セッション前提の機能追加時は、公開ページと保護ページの境界を明確にする。
