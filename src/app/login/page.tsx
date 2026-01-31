import { LoginButton } from '@/features/auth';
import { auth } from '@/shared/config/auth';
import { CircleHelp } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect('/mypage');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <div className="text-center">
          <h1 className="text-primary text-2xl font-bold tracking-tight">JRRA</h1>
          <p className="mt-2 mb-8 text-sm text-gray-500">Japan Ranranru Racing Association</p>
          <LoginButton />
        </div>

        <div className="mt-8 flex flex-col items-center">
          <p className="mt-2 text-sm text-gray-600">本サービスを利用するには Discord でのログインが必要です。</p>
          <p className="mb-4 text-sm text-gray-600">Discord ログイン時には Identify 権限を取得します。</p>
        </div>

        <div className="mt-8 rounded-lg bg-gray-50/50 p-4 ring-1 ring-gray-100">
          <div className="flex flex-col gap-2">
            <div className="text-primary flex items-center gap-2">
              <CircleHelp className="h-4 w-4" />
              <h3 className="text-sm font-semibold">Identify 権限について</h3>
            </div>
            <div className="text-sm text-gray-600">
              <p>
                あなたのユーザーID、ユーザー名、アバター画像などの基本的なプロフィール情報のみが取得出来ます。その他の情報やメッセージ、サーバーリストなどにはアクセス出来ない権限です。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
