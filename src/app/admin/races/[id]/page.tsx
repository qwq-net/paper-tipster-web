import { getRaceById } from '@/features/admin/manage-entries/actions';
import { getPayoutResults } from '@/features/admin/manage-races/actions';
import { RaceResultForm } from '@/features/admin/manage-races/ui/race-result-form';
import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { horses, raceEntries } from '@/shared/db/schema';
import { Badge, Button, Card, CardContent, CardHeader } from '@/shared/ui';
import { FormattedDate } from '@/shared/ui/formatted-date';
import { getBracketColor } from '@/shared/utils/bracket';
import { cn } from '@/shared/utils/cn';
import { eq } from 'drizzle-orm';
import { ChevronLeft, Info, Settings2, Trophy } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'レース詳細編集',
};

export default async function RaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  const [race, payoutResults] = await Promise.all([getRaceById(id), getPayoutResults(id)]);
  if (!race) {
    notFound();
  }
  const hasPayoutResults = payoutResults.length > 0;

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
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">{race.name}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <p>
              {race.date.replace(/-/g, '/')} @ {race.location}
            </p>
          </div>
        </div>
      </div>

      <div className={race.status === 'FINALIZED' ? 'grid gap-6 lg:grid-cols-3' : ''}>
        <div className={race.status === 'FINALIZED' ? 'lg:col-span-2' : ''}>
          {race.status === 'FINALIZED' ? (
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">確定済み結果</h2>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {entriesWithResult.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-3 transition-all hover:border-gray-200 hover:shadow-sm"
                    >
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-xl font-semibold transition-colors',
                          index === 0
                            ? 'border-amber-200 bg-amber-100 text-amber-700'
                            : index === 1
                              ? 'border-slate-200 bg-slate-100 text-slate-700'
                              : index === 2
                                ? 'border-orange-200 bg-orange-100 text-orange-700'
                                : 'border-gray-100 bg-gray-50 text-gray-400'
                        )}
                      >
                        {index + 1}
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded text-sm font-semibold ring-1 ring-black/5',
                            getBracketColor(entry.bracketNumber)
                          )}
                        >
                          {entry.bracketNumber || '?'}
                        </span>
                        <span className="text-primary bg-primary/10 ring-primary/10 flex h-7 w-7 items-center justify-center rounded text-sm font-semibold ring-1">
                          {entry.horseNumber || '?'}
                        </span>
                      </div>

                      <div className="flex-1">
                        <span className="text-base font-semibold text-gray-900">{entry.horseName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : entriesWithResult.length > 0 ? (
            <RaceResultForm
              raceId={race.id}
              hasPayoutResults={hasPayoutResults}
              entries={entriesWithResult.map((e) => ({
                id: e.id,
                horseNumber: e.horseNumber,
                horseName: e.horseName,
                bracketNumber: e.bracketNumber,
              }))}
              race={{
                id: race.id,
                eventId: race.eventId,
                date: race.date,
                location: race.location ?? '',
                name: race.name,
                raceNumber: race.raceNumber,
                status: race.status,
                surface: (race.surface as '芝' | 'ダート') || '芝',
                distance: race.distance,
                condition: (race.condition as '良' | '稍重' | '重' | '不良' | null) || null,
                closingAt: race.closingAt ? race.closingAt.toISOString() : null,
              }}
            />
          ) : (
            <Card className="border-none shadow-sm">
              <CardContent className="py-16 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-300">
                    <Info className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">出走馬が登録されていません</h3>
                <p className="text-sm text-gray-500">レース結果を確定するには、まず出走馬を登録する必要があります。</p>
                <Link href="/admin/entries" className="mt-6 inline-block">
                  <Button variant="outline" className="font-semibold">
                    出走馬を登録する
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {race.status === 'FINALIZED' && (
          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center gap-2 border-b border-gray-50 pb-4">
                <Settings2 className="h-4 w-4 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-900">レース情報</h2>
              </CardHeader>
              <CardContent className="space-y-4 pt-6 text-sm">
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <span className="font-medium text-gray-500">ステータス</span>
                  <Badge variant="status" label={race.status} />
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <span className="font-medium text-gray-500">コース</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="surface" label={race.surface} />
                    <span className="font-semibold text-gray-900">{race.distance}m</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <span className="font-medium text-gray-500">馬場状態</span>
                  <Badge variant="condition" label={race.condition} />
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <span className="font-medium text-gray-500">確定日時</span>
                  <span className="font-semibold text-gray-900">
                    {race.finalizedAt ? (
                      <FormattedDate
                        date={race.finalizedAt}
                        options={{ month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }}
                      />
                    ) : (
                      '-'
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
