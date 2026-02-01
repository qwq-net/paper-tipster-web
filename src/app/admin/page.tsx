import { db } from '@/shared/db';
import { bets, events, horses, races, users } from '@/shared/db/schema';
import { Card, CardContent, CardHeader } from '@/shared/ui';
import { count, sum } from 'drizzle-orm';
import { ArrowRight, Calendar, Carrot, ClipboardList, Coins, Ticket, TrendingUp, Trophy, Users } from 'lucide-react';
import Link from 'next/link';

export default async function AdminPage() {
  const [
    [totalUsersResult],
    [totalEventsResult],
    [totalHorsesResult],
    [totalRacesResult],
    [totalBetAmountResult],
    [totalPayoutAmountResult],
  ] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(events),
    db.select({ value: count() }).from(horses),
    db.select({ value: count() }).from(races),
    db.select({ value: sum(bets.amount) }).from(bets),
    db.select({ value: sum(bets.payout) }).from(bets),
  ]);

  const stats = [
    {
      label: '合計ユーザー数',
      value: totalUsersResult.value.toLocaleString(),
      icon: Users,
      color: 'border-l-primary',
      bg: 'bg-primary/10',
      text: 'text-primary',
    },
    {
      label: 'イベント数',
      value: totalEventsResult.value.toLocaleString(),
      icon: Calendar,
      color: 'border-l-orange-500',
      bg: 'bg-orange-50',
      text: 'text-orange-600',
    },
    {
      label: '登録馬数',
      value: totalHorsesResult.value.toLocaleString(),
      icon: Carrot,
      color: 'border-l-amber-500',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
    },
    {
      label: '合計レース数',
      value: totalRacesResult.value.toLocaleString(),
      icon: Trophy,
      color: 'border-l-purple-500',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
    },
    {
      label: '投資総額',
      value: `¥ ${(Number(totalBetAmountResult.value) || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'border-l-green-500',
      bg: 'bg-green-50',
      text: 'text-green-600',
    },
    {
      label: '払い戻し総額',
      value: `¥ ${(Number(totalPayoutAmountResult.value) || 0).toLocaleString()}`,
      icon: Coins,
      color: 'border-l-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
  ];

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-secondary text-3xl font-bold">ダッシュボード</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className={stat.color + ' border-l-4'}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={stat.bg + ' ' + stat.text + ' flex h-9 w-9 items-center justify-center rounded-full'}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                <h3 className="text-secondary text-lg font-bold">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-secondary text-xl font-bold">クイックアクション</h2>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link
            href="/admin/users"
            className="group flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-all hover:border-gray-200 hover:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-secondary font-bold">ユーザー管理</h4>
                <p className="text-xs text-gray-500">ユーザー一覧の確認と権限変更</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-blue-600" />
          </Link>

          <Link
            href="/admin/events"
            className="group flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-all hover:border-gray-200 hover:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 text-primary group-hover:bg-primary flex h-10 w-10 items-center justify-center rounded-lg transition-colors group-hover:text-white">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-secondary font-bold">イベント管理</h4>
                <p className="text-xs text-gray-500">イベントの追加・編集・確定処理</p>
              </div>
            </div>
            <ArrowRight className="group-hover:text-primary h-5 w-5 text-gray-300 transition-colors" />
          </Link>

          <Link
            href="/admin/horses"
            className="group flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-all hover:border-gray-200 hover:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                <Carrot className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-secondary font-bold">馬管理</h4>
                <p className="text-xs text-gray-500">競走馬の新規登録と情報管理</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-amber-600" />
          </Link>

          <Link
            href="/admin/races"
            className="group flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-all hover:border-gray-200 hover:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-secondary font-bold">レース管理</h4>
                <p className="text-xs text-gray-500">レースの作成・管理</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-purple-600" />
          </Link>

          <Link
            href="/admin/entries"
            className="group flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-all hover:border-gray-200 hover:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-secondary font-bold">出走馬管理</h4>
                <p className="text-xs text-gray-500">レースへの競走馬の割り当て</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-green-600" />
          </Link>

          <Link
            href="/admin/bets"
            className="group flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-all hover:border-gray-200 hover:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                <Ticket className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-secondary font-bold">馬券管理</h4>
                <p className="text-xs text-gray-500">購入された馬券の確認と管理</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-indigo-600" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
