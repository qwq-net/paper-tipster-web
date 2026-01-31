'use client';

import { Button, Card, CardContent, CardHeader } from '@/shared/ui';
import { useTransition } from 'react';
import { claimEvent } from '../actions';

type AvailableEvent = {
  id: string;
  name: string;
  description: string | null;
  distributeAmount: number;
  date: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED';
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
              <h3 className="text-lg font-bold">{event.name}</h3>
              <span
                className={`rounded px-2 py-1 text-xs font-bold ${
                  event.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {event.status === 'ACTIVE' ? '開催中' : '予定'}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">開催日: {event.date}</p>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <p className="mb-4 line-clamp-2 flex-1 text-sm text-gray-500">{event.description || '説明はありません'}</p>
            <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
              <span className="text-primary font-bold">配布: {event.distributeAmount.toLocaleString()} 円</span>
              <Button
                onClick={() => handleClaim(event.id)}
                disabled={isPending}
                size="sm"
                variant={event.status === 'ACTIVE' ? 'primary' : 'secondary'}
              >
                参加する
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
