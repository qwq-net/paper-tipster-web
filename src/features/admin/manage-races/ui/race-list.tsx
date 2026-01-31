import { Badge } from '@/shared/ui';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { getRaces } from '../actions';
import { EditRaceDialog } from './edit-race-dialog';

export async function RaceList() {
  const races = await getRaces();

  if (races.length === 0) {
    return <div className="py-12 text-center text-gray-500">登録されているレースはありません</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">開催日</th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">場所</th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
              レース名
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">距離</th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">馬場</th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">状態</th>
            <th className="w-20 px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600 uppercase">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {races.map((race) => (
            <tr key={race.id} className="transition-colors hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">{race.date.replace(/-/g, '/')}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{race.location}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{race.name}</td>
              <td className="px-4 py-3 text-sm text-gray-600">
                <Badge variant="surface" label={race.surface} />
                <span className="ml-1 text-xs font-bold text-gray-400">{race.distance}m</span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                <Badge variant="condition" label={race.condition} />
              </td>
              <td className="px-4 py-3 text-sm">
                <Badge variant="status" label={race.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/races/${race.id}`}
                    className="hover:text-primary flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <EditRaceDialog
                    race={{
                      ...race,
                      surface: race.surface as '芝' | 'ダート',
                      condition: race.condition as '良' | '稍重' | '重' | '不良' | null,
                    }}
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
