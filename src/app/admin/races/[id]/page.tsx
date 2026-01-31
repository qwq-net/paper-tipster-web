import { getRaceById } from '@/features/admin/manage-entries/actions';
import { RaceResultForm } from '@/features/admin/manage-races/ui/race-result-form';
import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { horses, raceEntries } from '@/shared/db/schema';
import { Card, CardContent, CardHeader } from '@/shared/ui';
import { getBracketColor } from '@/shared/utils/bracket';
import { eq } from 'drizzle-orm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export default async function RaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  const race = await getRaceById(id);
  if (!race) {
    notFound();
  }

  const entriesWithResult = await db
    .select({
      id: raceEntries.id,
      horseNumber: raceEntries.horseNumber,
      bracketNumber: raceEntries.bracketNumber,
      finishPosition: raceEntries.finishPosition,
      horseName: horses.name,
    })
    .from(raceEntries)
    .innerJoin(horses, eq(raceEntries.horseId, horses.id))
    .where(eq(raceEntries.raceId, id))
    .orderBy(raceEntries.finishPosition, raceEntries.horseNumber);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/races"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-gray-50"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{race.name}</h1>
          <p className="text-sm text-gray-500">
            {race.date.replace(/-/g, '/')} @ {race.location}
          </p>
        </div>
      </div>

      <div className={race.status === 'FINALIZED' ? 'grid gap-6 lg:grid-cols-3' : ''}>
        <div className={race.status === 'FINALIZED' ? 'lg:col-span-2' : ''}>
          {race.status === 'FINALIZED' ? (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">確定済み結果</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {entriesWithResult.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-2"
                    >
                      <div className="flex w-10 items-center justify-center text-lg font-black text-gray-300 italic">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${getBracketColor(entry.bracketNumber)}`}
                        >
                          {entry.bracketNumber || '?'}
                        </span>
                        <span className="text-primary bg-primary/10 flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold">
                          {entry.horseNumber || '?'}
                        </span>
                      </div>
                      <span className="flex-1 text-sm font-bold text-gray-900">{entry.horseName}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : entriesWithResult.length > 0 ? (
            <RaceResultForm
              raceId={race.id}
              entries={entriesWithResult.map((e) => ({
                id: e.id,
                horseNumber: e.horseNumber,
                horseName: e.horseName,
                bracketNumber: e.bracketNumber,
              }))}
              race={{
                status: race.status,
                surface: race.surface,
                distance: race.distance,
                condition: race.condition,
              }}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                出走馬が登録されていません。
                <br />
                <Link href="/admin/entries" className="text-primary mt-2 inline-block hover:underline">
                  出走馬を登録する
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {race.status === 'FINALIZED' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">レース情報</h2>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">ステータス</span>
                  <span className="font-medium">{race.status}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">コース</span>
                  <span className="font-medium">
                    {race.surface} {race.distance}m
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">馬場状態</span>
                  <span className="font-medium">{race.condition || '-'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
