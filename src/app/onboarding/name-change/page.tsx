import { NameChangeForm } from '@/features/user/ui/name-change-form';
import { auth } from '@/shared/config/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui';
import { redirect } from 'next/navigation';

export default async function OnboardingNameChangePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  if (session.user.isOnboardingCompleted) {
    redirect('/mypage');
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg border-none bg-white/90 shadow-2xl backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome to JRRA!</CardTitle>
          <CardDescription>
            はじめに、ユーザー名を設定してください。
            <br />
            この名前は後から変更可能です。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <NameChangeForm initialName={session.user.name || ''} />
        </CardContent>
      </Card>
    </div>
  );
}
