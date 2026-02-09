import { db } from '@/shared/db';
import { bets, events, horses, raceInstances, users } from '@/shared/db/schema';
import { Card, CardContent, CardHeader } from '@/shared/ui';
import { count, sum } from 'drizzle-orm';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Carrot,
  ClipboardList,
  Coins,
  Crown,
  Key,
  MapPin,
  Ticket,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '管理者ダッシュボード',
};

const COLOR_VARIANTS = {
  primary: {
    border: 'border-l-primary',
    bg: 'bg-primary/10',
    text: 'text-primary',
    qaBg: 'bg-primary/10',
    qaText: 'text-primary',
    qaHoverBg: 'group-hover:bg-primary',
    qaHoverText: 'group-hover:text-primary',
  },
  orange: {
    border: 'border-l-orange-500',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    qaBg: 'bg-orange-100',
    qaText: 'text-orange-600',
    qaHoverBg: 'group-hover:bg-orange-600',
    qaHoverText: 'group-hover:text-orange-600',
  },
  amber: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    qaBg: 'bg-amber-100',
    qaText: 'text-amber-600',
    qaHoverBg: 'group-hover:bg-amber-600',
    qaHoverText: 'group-hover:text-amber-600',
  },
  purple: {
    border: 'border-l-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    qaBg: 'bg-purple-100',
    qaText: 'text-purple-600',
    qaHoverBg: 'group-hover:bg-purple-600',
    qaHoverText: 'group-hover:text-purple-600',
  },
  green: {
    border: 'border-l-green-500',
    bg: 'bg-green-50',
    text: 'text-green-600',
    qaBg: 'bg-green-100',
    qaText: 'text-green-600',
    qaHoverBg: 'group-hover:bg-green-600',
    qaHoverText: 'group-hover:text-green-600',
  },
  blue: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    qaBg: 'bg-blue-100',
    qaText: 'text-blue-600',
    qaHoverBg: 'group-hover:bg-blue-600',
    qaHoverText: 'group-hover:text-blue-600',
  },
  indigo: {
    border: 'border-l-indigo-500',
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    qaBg: 'bg-indigo-100',
    qaText: 'text-indigo-600',
    qaHoverBg: 'group-hover:bg-indigo-600',
    qaHoverText: 'group-hover:text-indigo-600',
  },
  slate: {
    border: 'border-l-slate-500',
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    qaBg: 'bg-slate-100',
    qaText: 'text-slate-600',
    qaHoverBg: 'group-hover:bg-slate-600',
    qaHoverText: 'group-hover:text-slate-600',
  },
  emerald: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    qaBg: 'bg-emerald-100',
    qaText: 'text-emerald-600',
    qaHoverBg: 'group-hover:bg-emerald-600',
    qaHoverText: 'group-hover:text-emerald-600',
  },
  rose: {
    border: 'border-l-rose-500',
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    qaBg: 'bg-rose-100',
    qaText: 'text-rose-600',
    qaHoverBg: 'group-hover:bg-rose-600',
    qaHoverText: 'group-hover:text-rose-600',
  },
  teal: {
    border: 'border-l-teal-500',
    bg: 'bg-teal-50',
    text: 'text-teal-600',
    qaBg: 'bg-teal-100',
    qaText: 'text-teal-600',
    qaHoverBg: 'group-hover:bg-teal-600',
    qaHoverText: 'group-hover:text-teal-600',
  },
  sky: {
    border: 'border-l-sky-500',
    bg: 'bg-sky-50',
    text: 'text-sky-600',
    qaBg: 'bg-sky-100',
    qaText: 'text-sky-600',
    qaHoverBg: 'group-hover:bg-sky-600',
    qaHoverText: 'group-hover:text-sky-600',
  },
  cyan: {
    border: 'border-l-cyan-500',
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
    qaBg: 'bg-cyan-100',
    qaText: 'text-cyan-600',
    qaHoverBg: 'group-hover:bg-cyan-600',
    qaHoverText: 'group-hover:text-cyan-600',
  },
} as const;

type ColorVariant = keyof typeof COLOR_VARIANTS;

const QUICK_ACTIONS: {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
  color: ColorVariant;
}[] = [
  {
    href: '/admin/venues',
    icon: MapPin,
    label: '競馬場管理',
    description: '競馬場の場所・設定',
    color: 'slate',
  },
  {
    href: '/admin/horse-tags',
    icon: ClipboardList,
    label: '馬タグ管理',
    description: '脚質・特性マスタ',
    color: 'teal',
  },
  {
    href: '/admin/horses',
    icon: Carrot,
    label: '馬管理',
    description: '競走馬の新規登録と情報管理',
    color: 'amber',
  },
  {
    href: '/admin/race-definitions',
    icon: BookOpen,
    label: 'レース定義管理',
    description: '重賞名・条件マスタ',
    color: 'primary',
  },
  {
    href: '/admin/events',
    icon: Calendar,
    label: 'イベント管理',
    description: 'イベントの追加・編集・確定処理',
    color: 'indigo',
  },
  {
    href: '/admin/bet5',
    icon: Crown,
    label: 'BET5管理',
    description: 'BET5イベントの作成・結果確定',
    color: 'rose',
  },
  {
    href: '/admin/races',
    icon: Trophy,
    label: 'レース管理',
    description: 'レースの作成・管理',
    color: 'purple',
  },
  {
    href: '/admin/entries',
    icon: ClipboardList,
    label: '出走馬管理',
    description: 'レースへの競走馬の割り当て',
    color: 'emerald',
  },
  {
    href: '/admin/users',
    icon: Users,
    label: 'ユーザー管理',
    description: 'ユーザー一覧の確認と権限変更',
    color: 'sky',
  },
  {
    href: '/admin/users/guests',
    icon: Key,
    label: 'ゲストコード管理',
    description: 'ゲスト専用ログインコードの管理',
    color: 'slate',
  },
  {
    href: '/admin/bets',
    icon: Ticket,
    label: '馬券管理',
    description: '購入された馬券の確認と管理',
    color: 'cyan',
  },
];

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
    db.select({ value: count() }).from(raceInstances),
    db.select({ value: sum(bets.amount) }).from(bets),
    db.select({ value: sum(bets.payout) }).from(bets),
  ]);

  const stats = [
    {
      label: '合計ユーザー数',
      value: totalUsersResult.value.toLocaleString(),
      icon: Users,
      color: 'sky',
    },
    {
      label: 'イベント数',
      value: totalEventsResult.value.toLocaleString(),
      icon: Calendar,
      color: 'indigo',
    },
    {
      label: '登録馬数',
      value: totalHorsesResult.value.toLocaleString(),
      icon: Carrot,
      color: 'amber',
    },
    {
      label: '合計レース数',
      value: totalRacesResult.value.toLocaleString(),
      icon: Trophy,
      color: 'purple',
    },
    {
      label: '投資総額',
      value: `¥ ${(Number(totalBetAmountResult.value) || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'cyan',
    },
    {
      label: '払い戻し総額',
      value: `¥ ${(Number(totalPayoutAmountResult.value) || 0).toLocaleString()}`,
      icon: Coins,
      color: 'teal',
    },
  ] as const;

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-secondary text-2xl font-semibold">ダッシュボード</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const colors = COLOR_VARIANTS[stat.color as ColorVariant];
          return (
            <Card key={stat.label} className={colors.border + ' border-l-4'}>
              <CardContent className="flex items-center gap-4 p-4">
                <div
                  className={colors.bg + ' ' + colors.text + ' flex h-9 w-9 items-center justify-center rounded-full'}
                >
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <h3 className="text-secondary text-lg font-semibold">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-secondary text-xl font-semibold">クイックアクション</h2>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {QUICK_ACTIONS.map((action) => {
            const colors = COLOR_VARIANTS[action.color];
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-all hover:border-gray-200 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors group-hover:text-white ${colors.qaBg} ${colors.qaText} ${colors.qaHoverBg}`}
                  >
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-secondary font-semibold">{action.label}</h4>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
                <ArrowRight className={`h-5 w-5 text-gray-300 transition-colors ${colors.qaHoverText}`} />
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
