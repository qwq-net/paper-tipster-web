'use client';

import { EmojiKeypad } from '@/features/auth/ui/emoji-keypad';
import { GuestAuthTabs } from '@/features/auth/ui/guest-auth-tabs';
import { Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function GuestSignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

    const result = await signIn('credentials', {
      username,
      code,
      password,
      redirect: false,
    });

    if (result?.error) {
      setIsLoading(false);
      if (result.error === 'CredentialsSignin') {
        setError('登録に失敗しました。招待コード、ユーザー名を確認してください。');
      } else {
        setError(result.error);
      }
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <GuestAuthTabs activeTab="signup" />

        <div className="text-center">
          <h2 className="text-primary text-2xl font-bold tracking-tight">ゲスト登録</h2>
          <p className="mt-2 text-sm text-gray-500">招待コードと絵文字パスワードを入力して登録</p>
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
  );
}
