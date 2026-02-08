'use client';

import { EVENT_STATUS_LABELS, type EventStatus } from '@/shared/constants/status';
import { Button, Card, CardContent, CardHeader } from '@/shared/ui';
import { useTransition } from 'react';
import { claimEvent } from '../actions';

type AvailableEvent = {
  id: string;
  name: string;
  description: string | null;
  distributeAmount: number;
  date: string;
  status: EventStatus;
  isJoined?: boolean;
};

export function EventClaimList({ events }: { events: AvailableEvent[] }) {
  const [isPending, startTransition] = useTransition();

  const handleClaim = (eventId: string) => {
    startTransition(async () => {
      await claimEvent(eventId);
    });
  };

  if (events.length === 0) {
    return <div className="rounded bg-gray-50 p-4 text-center text-gray-500">現在参加可能なイベントはありません。</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Card key={event.id} className="flex flex-col transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">{event.name}</h3>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-sm font-semibold ${
                  event.isJoined
                    ? 'bg-blue-100 text-blue-700'
                    : event.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                }`}
              >
                {event.isJoined ? '参加済み' : EVENT_STATUS_LABELS[event.status]}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">開催日: {event.date}</p>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <p className="mb-4 line-clamp-2 flex-1 text-sm text-gray-500">{event.description || '説明はありません'}</p>
            <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
              <span className="text-primary font-semibold">配布: {event.distributeAmount.toLocaleString()} 円</span>
              <Button
                onClick={() => handleClaim(event.id)}
                disabled={isPending || event.status !== 'ACTIVE' || event.isJoined}
                size="sm"
                variant={event.isJoined ? 'outline' : event.status === 'ACTIVE' ? 'primary' : 'secondary'}
              >
                {event.isJoined ? '参加済み' : event.status === 'ACTIVE' ? '参加する' : '開始前'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
