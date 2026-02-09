'use client';

import { Badge, Button } from '@/shared/ui';
import { cn } from '@/shared/utils/cn';
import { Trophy } from 'lucide-react';
import Link from 'next/link';

interface Race {
  id: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  races: Race[];
}

export function Bet5EventList({ events }: { events: Event[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full min-w-[800px] border-collapse">
        <thead className="bg-gray-50">
          <tr className="border-b border-gray-100">
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              開催日
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              イベント名
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              登録レース数
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              ステータス
            </th>
            <th className="w-48 px-6 py-4 text-right text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {events.map((event) => {
            const raceCount = event.races.length;
            const isReady = raceCount === 5;

            return (
              <tr key={event.id} className="transition-colors hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap text-gray-400">{event.date}</td>
                <td className="px-6 py-4 text-sm whitespace-nowrap" title={event.name}>
                  <span className="font-medium text-gray-900">{event.name}</span>
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={cn('font-semibold', isReady ? 'text-green-600' : 'text-gray-500')}>
                      {raceCount}
                    </span>
                    <span className="text-gray-400">/ 5</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  {isReady ? (
                    <Badge label="設定可能" className="border-green-200 bg-green-100 text-green-700" />
                  ) : (
                    <Badge label="レース不足" variant="outline" className="text-gray-400" />
                  )}
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    {isReady ? (
                      <Button
                        size="sm"
                        asChild
                        className="gap-1 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                      >
                        <Link href={`/admin/events/${event.id}/bet5`}>
                          <Trophy className="h-4 w-4" />
                          設定
                        </Link>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="gap-1 opacity-50">
                        <Trophy className="h-4 w-4" />
                        設定
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
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
