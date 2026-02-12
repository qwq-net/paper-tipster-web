'use client';

import type { RankingDisplayMode } from '@/features/ranking/actions';
import { updateRankingDisplayMode } from '@/features/ranking/actions';
import { EVENT_STATUS_LABELS, type EventStatus } from '@/shared/constants/status';
import { Button, Card, CardContent } from '@/shared/ui';
import { Banknote, EyeOff, Pause, Play, RefreshCw, Square, Trophy, Users } from 'lucide-react';
import { useTransition } from 'react';
import { updateEventStatus } from '../actions';
import { EventForm } from './event-form';

type Event = {
  id: string;
  name: string;
  description: string | null;
  status: EventStatus;
  distributeAmount: number;
  date: string;
  rankingDisplayMode: RankingDisplayMode;
  loanAmount: number | null;
};

interface AdminEventEditorProps {
  event: Event;
  onSuccess?: () => void;
}

export function AdminEventEditor({ event, onSuccess }: AdminEventEditorProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: Event['status']) => {
    startTransition(async () => {
      await updateEventStatus(event.id, newStatus);
    });
  };

  const handleModeChange = (mode: RankingDisplayMode) => {
    startTransition(async () => {
      await updateRankingDisplayMode(event.id, mode);
    });
  };

  const getRankingModeLabel = (mode: string) => {
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

  return (
    <div className="space-y-6">
      <EventForm initialData={event} onSuccess={onSuccess} />

      <div className="border-t border-gray-100 pt-6">
        <h3 className="mb-4 text-sm font-medium text-gray-900">アクション</h3>

        <div className="space-y-4">
          <Card className="bg-gray-50">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-900">ステータス変更</p>
                <p className="text-sm text-gray-500">
                  現在のステータス: {EVENT_STATUS_LABELS[event.status] || event.status}
                </p>
              </div>
              <div className="flex gap-2">
                {event.status === 'SCHEDULED' && (
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStatusChange('ACTIVE')}
                    className="bg-green-600 font-semibold text-white hover:bg-green-700"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    開始
                  </Button>
                )}
                {event.status === 'ACTIVE' && (
                  <>
                    <Button
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleStatusChange('SCHEDULED')}
                      className="bg-amber-500 font-semibold text-white hover:bg-amber-600"
                    >
                      <Pause className="mr-2 h-4 w-4" />
                      一時停止
                    </Button>
                    <Button
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleStatusChange('COMPLETED')}
                      variant="destructive"
                    >
                      <Square className="mr-2 h-4 w-4" />
                      終了
                    </Button>
                  </>
                )}
                {event.status === 'COMPLETED' && (
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStatusChange('ACTIVE')}
                    className="bg-gray-500 font-semibold text-white hover:bg-gray-600"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    再開
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-900">WIN5 (BET5) 設定</p>
                <p className="text-sm text-gray-500">5レース的中投票の設定を行います</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => (window.location.href = `/admin/events/${event.id}/bet5`)}
              >
                設定へ移動
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-50">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-gray-900">ランキング公開設定</p>
                <p className="text-sm text-gray-500">現在の設定: {getRankingModeLabel(event.rankingDisplayMode)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={event.rankingDisplayMode === 'HIDDEN' ? 'secondary' : 'outline'}
                  disabled={isPending}
                  onClick={() => handleModeChange('HIDDEN')}
                  className={event.rankingDisplayMode === 'HIDDEN' ? 'bg-gray-200 text-gray-900' : ''}
                >
                  <EyeOff className="mr-2 h-4 w-4" />
                  非公開
                </Button>
                <Button
                  size="sm"
                  variant={event.rankingDisplayMode === 'ANONYMOUS' ? 'secondary' : 'outline'}
                  disabled={isPending}
                  onClick={() => handleModeChange('ANONYMOUS')}
                  className={
                    event.rankingDisplayMode === 'ANONYMOUS' ? 'bg-indigo-100 text-indigo-900 hover:bg-indigo-200' : ''
                  }
                >
                  <Users className="mr-2 h-4 w-4" />
                  匿名公開
                </Button>
                <Button
                  size="sm"
                  variant={event.rankingDisplayMode === 'FULL' ? 'secondary' : 'outline'}
                  disabled={isPending}
                  onClick={() => handleModeChange('FULL')}
                  className={
                    event.rankingDisplayMode === 'FULL' ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : ''
                  }
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  完全公開
                </Button>
                <Button
                  size="sm"
                  variant={event.rankingDisplayMode === 'FULL_WITH_LOAN' ? 'secondary' : 'outline'}
                  disabled={isPending}
                  onClick={() => handleModeChange('FULL_WITH_LOAN')}
                  className={
                    event.rankingDisplayMode === 'FULL_WITH_LOAN'
                      ? 'bg-orange-100 text-orange-900 hover:bg-orange-200'
                      : ''
                  }
                >
                  <Banknote className="mr-2 h-4 w-4" />
                  公開 (借金込み)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
