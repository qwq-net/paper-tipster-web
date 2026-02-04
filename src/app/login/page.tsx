import { LoginButton } from '@/features/auth';
import { TermsAgreement } from '@/features/auth/ui/terms-agreement';
import { auth } from '@/shared/config/auth';
import { CircleHelp } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect('/mypage');
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <div className="text-center">
          <h1 className="text-primary text-2xl font-semibold tracking-tight">JRRA</h1>
          <p className="mt-2 mb-8 text-sm text-gray-500">Japan Ranranru Racing Association</p>
          <LoginButton />
        </div>

        <div className="mt-8 flex flex-col items-center">
          <TermsAgreement />
        </div>

        <div className="mt-8 rounded-lg bg-gray-50/50 p-4 ring-1 ring-gray-100">
          <div className="flex flex-col gap-2">
            <div className="text-primary flex items-center gap-2">
              <CircleHelp className="h-4 w-4" />
              <h3 className="text-sm font-semibold">Discord ログインで使用する権限について</h3>
            </div>
            <div className="text-sm text-gray-600">
              <p>
                ユーザーID、ユーザー名、アバター画像などの基本的なプロフィール情報のみを取得し、それ以外の情報にはアクセス出来ない権限を使用します。
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <a href="/login/guest" className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline">
            ゲストログインページへ
          </a>
        </div>
      </div>
    </div>
  );
}
