'use client';

import { useTransition } from 'react';
import { updateEventStatus } from '../actions';

type Event = {
  id: string;
  name: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED';
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
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100 font-bold text-gray-700 uppercase">
          <tr>
            <th className="px-4 py-3">ステータス</th>
            <th className="px-4 py-3">イベント名</th>
            <th className="px-4 py-3">配布金額</th>
            <th className="px-4 py-3">開催日</th>
            <th className="px-4 py-3">操作</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <span
                  className={`rounded px-2 py-1 text-xs font-semibold ${
                    event.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : event.status === 'COMPLETED'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {event.status}
                </span>
              </td>
              <td className="max-w-[200px] truncate px-4 py-3 font-medium" title={event.name}>
                {event.name}
              </td>
              <td className="px-4 py-3">{event.distributeAmount.toLocaleString()} 円</td>
              <td className="px-4 py-3 text-xs text-gray-500">{event.date}</td>
              <td className="flex min-w-[150px] gap-2 px-4 py-3">
                {event.status === 'SCHEDULED' && (
                  <button
                    disabled={isPending}
                    onClick={() => handleStatusChange(event.id, 'ACTIVE')}
                    className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Start
                  </button>
                )}
                {event.status === 'ACTIVE' && (
                  <>
                    <button
                      disabled={isPending}
                      onClick={() => handleStatusChange(event.id, 'SCHEDULED')}
                      className="rounded bg-yellow-500 px-3 py-1 text-xs text-white hover:bg-yellow-600 disabled:opacity-50"
                    >
                      Pause
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() => handleStatusChange(event.id, 'COMPLETED')}
                      className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      End
                    </button>
                  </>
                )}
                {event.status === 'COMPLETED' && (
                  <button
                    disabled={isPending}
                    onClick={() => handleStatusChange(event.id, 'ACTIVE')}
                    className="rounded bg-gray-500 px-3 py-1 text-xs text-white hover:bg-gray-600 disabled:opacity-50"
                  >
                    Re-Open
                  </button>
                )}
              </td>
            </tr>
          ))}
          {events.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                No events found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
