'use client';

import { Badge, Button } from '@/shared/ui';
import { cn } from '@/shared/utils/cn';
import { Trophy } from 'lucide-react';
import Link from 'next/link';

interface Race {
  id: string;
  name: string;
  raceNumber: number | null;
}

interface Bet5Event {
  id: string;
  race1: Race;
  race2: Race;
  race3: Race;
  race4: Race;
  race5: Race;
}

interface Event {
  id: string;
  name: string;
  date: string;
  races: Race[];
  bet5Event: Bet5Event | null;
}

export function Bet5EventList({ events }: { events: Event[] }) {
  const getSelectedRacesText = (bet5Event: Bet5Event) => {
    const races = [bet5Event.race1, bet5Event.race2, bet5Event.race3, bet5Event.race4, bet5Event.race5];
    return races.map((r) => `${r.raceNumber}R`).join(' > ');
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full min-w-[800px] border-collapse">
        <thead className="bg-gray-50">
          <tr className="border-b border-gray-100">
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              イベント名
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              対象レース構成
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
            const isConfigured = !!event.bet5Event;
            const isReady = raceCount >= 5;

            return (
              <tr key={event.id} className="transition-colors hover:bg-gray-50">
                <td className="px-6 py-4 text-sm whitespace-nowrap" title={event.name}>
                  <div>
                    <div className="font-semibold text-gray-900">{event.name}</div>
                    <div className="text-sm text-gray-400">{event.date}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-600">
                  {event.bet5Event ? (
                    <span className="font-mono">{getSelectedRacesText(event.bet5Event)}</span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
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
                  {isConfigured ? (
                    <Badge label="設定済み" className="border-blue-200 bg-blue-100 text-blue-700" />
                  ) : isReady ? (
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
                        variant={isConfigured ? 'outline' : 'primary'}
                        className={cn(
                          'gap-1 shadow-sm',
                          !isConfigured && 'bg-indigo-600 text-white hover:bg-indigo-700'
                        )}
                      >
                        <Link href={`/admin/events/${event.id}/bet5`}>
                          <Trophy className="h-4 w-4" />
                          {isConfigured ? '管理' : '設定'}
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
