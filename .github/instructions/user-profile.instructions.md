---
applyTo: 'src/features/user/**/*.ts,src/features/user/**/*.tsx,src/app/mypage/**/*.ts,src/app/mypage/**/*.tsx,src/app/onboarding/**/*.ts,src/app/onboarding/**/*.tsx'
---

# User / MyPage 実装ルール

- ユーザー名などのプロフィール更新は既存の一意性・バリデーションを維持する。
- マイページの表示は、イベント依存情報（残高・成績・購入履歴）の境界を崩さない。
- 日時・数値表示は既存方針（JST, `ja-JP`）に合わせる。
- 既存の導線（結果、ウォレット、即BET、受取）を壊すUI変更を避ける。
- セッション依存ページは未認証アクセス時の既存挙動を維持する。

品質:

- UIは `src/shared/ui` を優先再利用する。
- 実装後は `task check` と `task test` を実行する（必要時のみ `task test-full`）。
