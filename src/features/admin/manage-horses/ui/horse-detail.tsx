import { Badge, Card, CardContent, CardHeader } from '@/shared/ui';
import { getGenderAge } from '@/shared/utils/gender';
import { Calendar, MapPin, Tag, Trophy } from 'lucide-react';
import Link from 'next/link';

interface HorseDetailProps {
  horse: {
    id: string;
    name: string;
    gender: string;
    age: number | null;
    origin: string;
    type: string;
    notes: string | null;
    tags: Array<{ type: string; content: string }>;
  };
  wins: Array<{
    id: string;
    raceName: string;
    raceDate: string;
    grade: string | null;
    surface: string;
    distance: number;
    eventId: string;
    eventName: string;
    type: 'RESULT' | 'MANUAL';
  }>;
}

export function HorseDetail({ horse, wins }: HorseDetailProps) {
  const originLabels: Record<string, string> = {
    DOMESTIC: '日本産',
    FOREIGN_BRED: '外国産',
    FOREIGN_TRAINED: '外来馬',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <span className="text-2xl">{horse.name}</span>
              <span
                className={`ml-2 rounded px-2 py-0.5 text-sm font-medium ${
                  horse.type === 'REAL' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                }`}
              >
                {horse.type === 'REAL' ? '実在' : '架空'}
              </span>
            </h3>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4">
              <Badge label={originLabels[horse.origin] || '不明'} variant="origin" className="px-3 py-1 text-base" />
              <Badge label={getGenderAge(horse.gender, horse.age)} variant="gender" className="px-3 py-1 text-base" />
            </div>

            {horse.notes && (
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 text-sm font-semibold text-gray-500">備考</h4>
                <p className="whitespace-pre-wrap text-gray-700">{horse.notes}</p>
              </div>
            )}

            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-500">
                <Tag className="h-4 w-4" />
                登録タグ
              </h4>
              <div className="flex flex-wrap gap-2">
                {horse.tags.length > 0 ? (
                  horse.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-700 ring-1 ring-gray-600/10 ring-inset"
                    >
                      {tag.content}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">タグなし</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">通算戦績</h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
              <div className="flex flex-col items-center">
                <Trophy className="mb-2 h-10 w-10 text-yellow-500" />
                <div className="text-3xl font-semibold text-gray-900">{wins.length}勝</div>
              </div>

              {wins.filter((w) => ['G1', 'G2', 'G3'].includes(w.grade || '') || w.type === 'MANUAL').length > 0 && (
                <div className="w-full space-y-2 border-t pt-4">
                  <p className="text-center text-sm font-semibold text-gray-500 uppercase">主な勝ち鞍</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {wins
                      .filter((w) => ['G1', 'G2', 'G3'].includes(w.grade || '') || w.type === 'MANUAL')
                      .sort((a, b) => {
                        if (a.type !== b.type) return a.type === 'MANUAL' ? -1 : 1;
                        const grades = { G1: 1, G2: 2, G3: 3 };
                        return (
                          (grades[a.grade as keyof typeof grades] || 99) -
                          (grades[b.grade as keyof typeof grades] || 99)
                        );
                      })
                      .slice(0, 5)
                      .map((win, i) => (
                        <span key={i} className="text-primary text-sm font-semibold">
                          {win.raceName}
                          {win.grade && <span className="ml-0.5 text-sm text-gray-400">({win.grade})</span>}
                          {i <
                            Math.min(
                              5,
                              wins.filter((w) => ['G1', 'G2', 'G3'].includes(w.grade || '') || w.type === 'MANUAL')
                                .length
                            ) -
                              1 && <span className="mx-1 text-gray-300">/</span>}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Trophy className="h-5 w-5 text-yellow-500" />
            勝ち鞍一覧
          </h3>
        </CardHeader>
        <CardContent>
          {wins.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider text-gray-500 uppercase">
                      開催日
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider text-gray-500 uppercase">
                      レース名/称号
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider text-gray-500 uppercase">
                      条件/区分
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider text-gray-500 uppercase">
                      イベント
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {wins.map((win) => (
                    <tr key={win.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {win.raceDate || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap text-gray-900">
                        {win.raceName}
                        {win.grade && (
                          <span
                            className={`ml-2 rounded px-1.5 py-0.5 text-sm font-semibold text-white ${
                              win.grade === 'G1'
                                ? 'bg-blue-600'
                                : win.grade === 'G2'
                                  ? 'bg-red-600'
                                  : win.grade === 'G3'
                                    ? 'bg-green-600'
                                    : 'bg-gray-500'
                            }`}
                          >
                            {win.grade}
                          </span>
                        )}
                        {win.type === 'MANUAL' && (
                          <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-sm font-semibold text-amber-700">
                            称号
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                        {win.type === 'RESULT' ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {win.surface} {win.distance}m
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">特別表彰</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-blue-600 hover:text-blue-800">
                        {win.type === 'RESULT' ? (
                          <Link href={`/admin/events/${win.eventId}`}>{win.eventName}</Link>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">勝ち鞍の記録はありません</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
