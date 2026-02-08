'use client';

import { toggleRankingVisibility } from '@/features/ranking/actions';
import { EVENT_STATUS_LABELS, type EventStatus } from '@/shared/constants/status';
import { Button, Card, CardContent } from '@/shared/ui';
import { Pause, Play, RefreshCw, Square, Trophy } from 'lucide-react';
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
  rankingPublished: boolean;
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

  const handleRankingToggle = () => {
    startTransition(async () => {
      await toggleRankingVisibility(event.id, !event.rankingPublished);
    });
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
                <p className="font-medium text-gray-900">ランキング公開設定</p>
                <p className="text-sm text-gray-500">{event.rankingPublished ? '現在公開中です' : '現在非公開です'}</p>
              </div>
              <Button
                size="sm"
                variant={event.rankingPublished ? 'secondary' : 'outline'}
                disabled={isPending}
                onClick={handleRankingToggle}
                className={event.rankingPublished ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : ''}
              >
                <Trophy className={`mr-2 h-4 w-4 ${event.rankingPublished ? 'text-amber-600' : 'text-gray-500'}`} />
                {event.rankingPublished ? '非公開にする' : '公開する'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
