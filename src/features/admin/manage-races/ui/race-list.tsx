import { getRaceDefinitions } from '@/features/admin/manage-race-definitions/actions';
import { getVenues } from '@/features/admin/manage-venues/actions';
import { RaceCondition } from '@/shared/types/race';
import { Badge, Button } from '@/shared/ui';
import { FormattedDate } from '@/shared/ui/formatted-date';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { getRaces } from '../actions';
import { EditRaceDialog } from './edit-race-dialog';

interface RaceListProps {
  events: Array<{ id: string; name: string; date: string }>;
}

export async function RaceList({ events }: RaceListProps) {
  const [races, raceDefinitions, venues] = await Promise.all([getRaces(), getRaceDefinitions(), getVenues()]);

  if (races.length === 0) {
    return <div className="py-12 text-center text-gray-500">登録されているレースはありません</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full min-w-[800px] border-collapse">
        <thead className="bg-gray-50">
          <tr className="border-b border-gray-100">
            <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider whitespace-nowrap text-gray-400 uppercase">
              イベント
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider whitespace-nowrap text-gray-400 uppercase">
              レース名
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider whitespace-nowrap text-gray-400 uppercase">
              場所
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider whitespace-nowrap text-gray-400 uppercase">
              距離
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider whitespace-nowrap text-gray-400 uppercase">
              馬場
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider whitespace-nowrap text-gray-400 uppercase">
              締切
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider whitespace-nowrap text-gray-400 uppercase">
              状態
            </th>
            <th className="w-24 px-6 py-4 text-right text-sm font-semibold tracking-wider whitespace-nowrap text-gray-400 uppercase">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {races.map((race) => (
            <tr key={race.id} className="transition-colors hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{race.event.name}</td>
              <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap text-gray-900">{race.name}</td>
              <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap text-gray-500">{race.location}</td>
              <td className="px-6 py-4 text-sm whitespace-nowrap">
                <Badge variant="surface" label={race.surface} />
                <span className="ml-1.5 text-sm font-semibold text-gray-400">{race.distance}m</span>
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap">
                <Badge variant="condition" label={race.condition} />
              </td>
              <td className="px-6 py-2 text-sm font-semibold whitespace-nowrap text-gray-500">
                {race.closingAt ? (
                  <FormattedDate date={race.closingAt} options={{ hour: '2-digit', minute: '2-digit' }} />
                ) : (
                  <span className="text-gray-200">-</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap">
                <Badge variant="status" label={race.status} />
              </td>
              <td className="px-6 py-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/races/${race.id}`}>
                      <Eye className="h-4 w-4 text-gray-400" />
                    </Link>
                  </Button>
                  <EditRaceDialog
                    events={events}
                    race={{
                      ...race,
                      location: race.location ?? '',
                      surface: race.surface as '芝' | 'ダート',
                      condition: race.condition as RaceCondition | null,
                      closingAt: race.closingAt,
                      venueId: race.venueId ?? undefined,
                      raceDefinitionId: race.raceDefinitionId,
                      direction: race.direction,
                    }}
                    raceDefinitions={raceDefinitions}
                    venues={venues}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
