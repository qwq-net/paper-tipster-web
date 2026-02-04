'use client';

import { checkIpLockStatus, validateGuestRegistration } from '@/features/auth/actions/auth-actions';
import { EmojiKeypad } from '@/features/auth/ui/emoji-keypad';
import { GuestAuthTabs } from '@/features/auth/ui/guest-auth-tabs';
import { TermsAgreement } from '@/features/auth/ui/terms-agreement';
import { Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function GuestSignupPage() {
  const router = useRouter();
  // ... (useState hooks remain same)
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ... (handlers remain same)
  const handleEmojiClick = (emoji: string) => {
    if ([...password].length >= 6) return;
    setPassword((prev) => prev + emoji);
  };

  const handleBackspace = () => {
    const chars = [...password];
    chars.pop();
    setPassword(chars.join(''));
  };

  const handleClear = () => {
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // ... (handleSubmit content remains same)
    e.preventDefault();
    if (!username || !code || !password) {
      setError('すべての項目を入力してください');
      return;
    }

    if ([...password].length < 3) {
      setError('絵文字パスワードは3文字以上で入力してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    const ipLockStatus = await checkIpLockStatus();
    if (ipLockStatus.isLocked) {
      setIsLoading(false);
      setError(`アクセスが制限されています。解除まであと約${ipLockStatus.remainingMinutes}分です。`);
      return;
    }

    const validationResult = await validateGuestRegistration(code, username);
    if (validationResult.error) {
      setIsLoading(false);
      switch (validationResult.error) {
        case 'RateLimitExceeded':
          setError(`アクセスが制限されています。解除まであと約${validationResult.remainingMinutes}分です。`);
          break;
        case 'InvalidGuestCode':
          setError('無効な招待コードです。');
          break;
        case 'UsernameTaken':
          setError('このユーザー名は既に使用されています。');
          break;
        default:
          setError('エラーが発生しました。');
      }
      return;
    }

    const result = await signIn('credentials', {
      username,
      code,
      password,
      redirect: false,
    });

    if (result?.error) {
      setIsLoading(false);

      if (result.error === 'RateLimitExceeded') {
        const postIpLockStatus = await checkIpLockStatus();
        if (postIpLockStatus.isLocked) {
          setError(
            `試行回数制限を超えました。一定時間アクセスを制限します。（解除まであと約${postIpLockStatus.remainingMinutes}分）`
          );
          return;
        }
      }

      switch (result.error) {
        case 'InvalidGuestCode':
          setError('無効な招待コードです。');
          break;
        case 'UsernameTaken':
          setError('このユーザー名は既に使用されています。');
          break;
        case 'RateLimitExceeded':
          setError('試行回数制限を超えました。しばらく待ってから再度お試しください。');
          break;
        case 'CredentialsSignin':
          setError('登録に失敗しました。入力内容を確認してください。');
          break;
        default:
          setError('エラーが発生しました: ' + result.error);
      }
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-4">
        <div>
          <Link
            href="/login"
            className="flex w-fit items-center text-sm text-gray-500 transition-colors hover:text-gray-900 hover:underline"
          >
            <span>←</span>
            <span className="ml-1">通常ログインに戻る</span>
          </Link>
        </div>

        <div className="space-y-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <GuestAuthTabs activeTab="signup" />

          <div className="text-center">
            <h2 className="text-primary text-xl font-semibold tracking-tight">ゲスト登録</h2>
            <p className="mt-2 text-sm text-gray-500">招待コードと絵文字パスワードを入力</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                招待コード
              </label>
              <div className="mt-1">
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  autoComplete="off"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                  placeholder="管理者からコードを受け取ってください"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                ユーザー名
                <span className="ml-2 text-sm font-normal text-gray-500">（英数字、ひらがな、カタカナ、漢字）</span>
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                  placeholder="表示名を入力"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                絵文字パスワード
                <span className="ml-2 text-sm font-normal text-gray-500">（3〜6文字）</span>
              </label>

              <input
                type="password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
              />

              <div className="mb-4 flex min-h-[50px] items-center justify-center rounded-lg border border-gray-200 bg-gray-100 p-3 text-center text-xl tracking-widest">
                {password || <span className="text-xl font-normal tracking-normal text-gray-400">絵文字を選択</span>}
              </div>

              <EmojiKeypad onEmojiClick={handleEmojiClick} onBackspace={handleBackspace} onClear={handleClear} />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">登録エラー</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <TermsAgreement className="mb-4" />
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
              >
                {isLoading && <Loader2 className="mr-2 -ml-1 h-4 w-4 animate-spin" />}
                {isLoading ? '登録処理中...' : '登録して参加'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
