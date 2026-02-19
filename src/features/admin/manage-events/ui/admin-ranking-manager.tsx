'use client';

import { type RankingData } from '@/entities/ranking';
import { type RankingDisplayMode, updateRankingDisplayMode } from '@/features/ranking';
import { Badge, Button } from '@/shared/ui';
import { Banknote, ChevronLeft, EyeOff, Trophy, Users } from 'lucide-react';
import Link from 'next/link';
import { useOptimistic, useTransition } from 'react';
import { toast } from 'sonner';

interface AdminRankingManagerProps {
  eventId: string;
  eventName: string;
  initialRanking: RankingData[];
  initialDisplayMode: RankingDisplayMode;
  distributeAmount: number;
}

export function AdminRankingManager({
  eventId,
  eventName,
  initialRanking,
  initialDisplayMode,
  distributeAmount,
}: AdminRankingManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticMode, setOptimisticMode] = useOptimistic(
    initialDisplayMode,
    (_state, newMode: RankingDisplayMode) => newMode
  );

  const handleModeChange = (mode: RankingDisplayMode) => {
    startTransition(async () => {
      setOptimisticMode(mode);
      try {
        await updateRankingDisplayMode(eventId, mode);
        toast.success('ランキング公開設定を更新しました');
      } catch (error) {
        console.error(error);
        toast.error('設定の更新に失敗しました');
      }
    });
  };

  const getDisplayModeLabel = (mode: RankingDisplayMode) => {
    switch (mode) {
      case 'HIDDEN':
        return '非公開';
      case 'ANONYMOUS':
        return '匿名公開';
      case 'FULL':
        return '完全公開';
      case 'FULL_WITH_LOAN':
        return '公開 (借金込み)';
      default:
        return mode;
    }
  };

  const currentModeLabel = getDisplayModeLabel(optimisticMode);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/events/${eventId}`}
            className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            <ChevronLeft size={16} />
            イベント詳細へ戻る
          </Link>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">ランキング管理</h1>
            <p className="mt-1 text-sm text-gray-500">{eventName} のランキング確認と公開設定</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-gray-900">公開設定</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">
              現在の設定: <span className="font-medium text-gray-900">{currentModeLabel}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={optimisticMode === 'HIDDEN' ? 'secondary' : 'outline'}
              disabled={isPending}
              onClick={() => handleModeChange('HIDDEN')}
              className={optimisticMode === 'HIDDEN' ? 'bg-gray-200 text-gray-900' : ''}
            >
              <EyeOff className="mr-2 h-4 w-4" />
              非公開
            </Button>
            <Button
              size="sm"
              variant={optimisticMode === 'ANONYMOUS' ? 'secondary' : 'outline'}
              disabled={isPending}
              onClick={() => handleModeChange('ANONYMOUS')}
              className={optimisticMode === 'ANONYMOUS' ? 'bg-indigo-100 text-indigo-900 hover:bg-indigo-200' : ''}
            >
              <Users className="mr-2 h-4 w-4" />
              匿名公開
            </Button>
            <Button
              size="sm"
              variant={optimisticMode === 'FULL' ? 'secondary' : 'outline'}
              disabled={isPending}
              onClick={() => handleModeChange('FULL')}
              className={optimisticMode === 'FULL' ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : ''}
            >
              <Trophy className="mr-2 h-4 w-4" />
              公開
            </Button>
            <Button
              size="sm"
              variant={optimisticMode === 'FULL_WITH_LOAN' ? 'secondary' : 'outline'}
              disabled={isPending}
              onClick={() => handleModeChange('FULL_WITH_LOAN')}
              className={optimisticMode === 'FULL_WITH_LOAN' ? 'bg-orange-100 text-orange-900 hover:bg-orange-200' : ''}
            >
              <Banknote className="mr-2 h-4 w-4" />
              借金込み
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">ランキング一覧 (管理者ビュー)</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium whitespace-nowrap">順位</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">ユーザー名</th>
                <th className="px-6 py-3 text-right font-medium whitespace-nowrap">所持金</th>
                <th className="px-6 py-3 text-right font-medium whitespace-nowrap">収支</th>
                <th className="px-6 py-3 text-right font-medium whitespace-nowrap">借入総額</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialRanking.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    参加者がいません
                  </td>
                </tr>
              ) : (
                initialRanking.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold ${
                          user.rank === 1
                            ? 'bg-amber-100 text-amber-700'
                            : user.rank === 2
                              ? 'bg-gray-200 text-gray-700'
                              : user.rank === 3
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {user.rank}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium whitespace-nowrap text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-right font-medium whitespace-nowrap text-gray-900">
                      {Number(user.balance).toLocaleString('ja-JP')} 円
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span
                        className={`font-medium ${
                          Number(user.balance) - distributeAmount >= 0 ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {Number(user.balance) - distributeAmount >= 0 ? '+' : ''}
                        {(Number(user.balance) - distributeAmount).toLocaleString('ja-JP')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {user.totalLoaned && user.totalLoaned > 0 ? (
                        <Badge
                          label={`${user.totalLoaned.toLocaleString('ja-JP')} 円`}
                          className="bg-orange-100 text-orange-800 ring-orange-200"
                        />
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
