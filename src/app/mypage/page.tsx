import { UserProfile } from '@/entities/user';
import { LogoutButton } from '@/features/auth';
import { WalletOverview, getEventWallets } from '@/features/economy/wallet';
import { auth } from '@/shared/config/auth';
import { Button, Card, CardContent } from '@/shared/ui';
import { Coins, Zap } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function MyPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const userWallets = await getEventWallets(session.user.id);

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <UserProfile user={session.user} />
            <div className="flex items-center gap-4">
              {session.user.role === 'ADMIN' && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    Admin Panel
                  </Button>
                </Link>
              )}
              <LogoutButton />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Link href="/mypage/claim">
            <Card className="hover:border-primary group h-full transition-all hover:shadow-xl">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 transition-transform group-hover:scale-110">
                  <Coins size={32} />
                </div>
                <h3 className="text-xl leading-tight font-bold text-gray-900">おこずかいを貰う</h3>
                <p className="mt-2 text-xs text-gray-500">イベントに参加して資金をチャージ</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/mypage/sokupat">
            <Card className="hover:border-primary group h-full transition-all hover:shadow-xl">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-600 transition-transform group-hover:scale-110">
                  <Zap size={32} />
                </div>
                <h3 className="text-xl leading-tight font-bold text-gray-900">即PAT</h3>
                <p className="mt-2 text-xs text-gray-500">開催中のレースへ投票（馬券購入）</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-secondary text-xl font-bold">参加済みイベント / ウォレット</h2>
          </div>
          <WalletOverview wallets={userWallets} />
        </section>
      </div>
    </div>
  );
}
