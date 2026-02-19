'use client';

import { type EventStatus } from '@/shared/constants/status';
import { Badge, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui';
import { ChevronDown, Pause, Play, RefreshCw, Square, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useTransition } from 'react';
import { updateEventStatus } from '../actions';

type Event = {
  id: string;
  name: string;
  description: string | null;
  status: EventStatus;
  distributeAmount: number;
  date: string;
};

export function EventList({ events }: { events: Event[] }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (eventId: string, newStatus: Event['status']) => {
    startTransition(async () => {
      await updateEventStatus(eventId, newStatus);
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full min-w-[800px] border-collapse">
        <thead className="bg-gray-50">
          <tr className="border-b border-gray-100">
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              ステータス
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              イベント名
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              配布金額
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              開催日
            </th>
            <th className="w-48 px-6 py-4 text-right text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {events.map((event) => (
            <tr key={event.id} className="transition-colors hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge label={event.status} variant="status" />
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap" title={event.name}>
                <Link
                  prefetch={false}
                  href={`/admin/events/${event.id}`}
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {event.name}
                </Link>
              </td>
              <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap text-gray-600">
                {event.distributeAmount.toLocaleString('ja-JP')} 円
              </td>
              <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap text-gray-400">{event.date}</td>
              <td className="px-6 py-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-2">
                  <Button asChild size="sm" variant="outline" className="gap-1">
                    <Link href={`/admin/events/${event.id}/ranking`} title="ランキング管理">
                      <Trophy className="h-3.5 w-3.5" />
                      順位
                    </Link>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" disabled={isPending} className="gap-1">
                        変更
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {event.status === 'SCHEDULED' && (
                        <DropdownMenuItem variant="success" onClick={() => handleStatusChange(event.id, 'ACTIVE')}>
                          <Play className="h-4 w-4" />
                          開始
                        </DropdownMenuItem>
                      )}
                      {event.status === 'ACTIVE' && (
                        <>
                          <DropdownMenuItem variant="warning" onClick={() => handleStatusChange(event.id, 'SCHEDULED')}>
                            <Pause className="h-4 w-4" />
                            一時停止
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleStatusChange(event.id, 'COMPLETED')}
                          >
                            <Square className="h-4 w-4" />
                            終了
                          </DropdownMenuItem>
                        </>
                      )}
                      {event.status === 'COMPLETED' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(event.id, 'ACTIVE')}>
                          <RefreshCw className="h-4 w-4" />
                          再開
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
          {events.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-gray-400">
                表示できるイベントがありません
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
