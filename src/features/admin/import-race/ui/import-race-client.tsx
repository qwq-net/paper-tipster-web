'use client';

import { Badge, Button, Card, Checkbox, Input, Label, Select } from '@/shared/ui';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { fetchRacePreview, importRace } from '../actions';
import type { RacePreviewWithHorseStatus } from '../model/types';

const GENDER_LABELS: Record<string, string> = {
  HORSE: '牡',
  MARE: '牝',
  GELDING: 'セ',
};

type EventItem = { id: string; name: string; date: string };
type VenueItem = { id: string; name: string; shortName: string; code: string | null };

type Props = {
  events: EventItem[];
  venues: VenueItem[];
};

export function ImportRaceClient({ events, venues }: Props) {
  const router = useRouter();
  const [isPendingFetch, startFetchTransition] = useTransition();
  const [isPendingImport, startImportTransition] = useTransition();

  const [url, setUrl] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [preview, setPreview] = useState<RacePreviewWithHorseStatus | null>(null);

  const [raceName, setRaceName] = useState('');
  const [raceDate, setRaceDate] = useState(() => new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }));
  const [venueId, setVenueId] = useState('');
  const [eventId, setEventId] = useState('');
  const [fixedOddsMode, setFixedOddsMode] = useState(true);

  function handleFetch() {
    setFetchError(null);
    startFetchTransition(async () => {
      const result = await fetchRacePreview(url.trim());
      if (!result.success) {
        setFetchError(result.error);
        setPreview(null);
        return;
      }
      setPreview(result.data);
      setRaceName(result.data.raceInfo.raceName);
      setRaceDate(new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }));
      const matched = venues.find((v) => v.code === result.data.raceInfo.netkeibaVenueCode);
      setVenueId(matched?.id ?? '');
      setEventId(events[0]?.id ?? '');
    });
  }

  function handleImport() {
    if (!preview) return;
    if (!eventId) {
      toast.error('イベントを選択してください');
      return;
    }
    if (!venueId) {
      toast.error('競馬場を選択してください');
      return;
    }
    if (!raceDate) {
      toast.error('開催日を入力してください');
      return;
    }
    if (!raceName.trim()) {
      toast.error('レース名を入力してください');
      return;
    }

    startImportTransition(async () => {
      const result = await importRace({
        url: preview.sourceUrl,
        eventId,
        venueId,
        date: raceDate,
        raceName: raceName.trim(),
        raceNumber: preview.raceInfo.raceNumber,
        distance: preview.raceInfo.distance,
        surface: preview.raceInfo.surface,
        direction: preview.raceInfo.direction,
        condition: preview.raceInfo.condition,
        fixedOddsMode,
        horses: preview.horses.map((h) => ({
          horseNumber: h.horseNumber,
          bracketNumber: h.bracketNumber,
          name: h.name,
          gender: h.gender,
          age: h.age,
          jockey: h.jockey,
          odds: h.odds,
        })),
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success('インポートが完了しました');
      router.push('/admin/races');
    });
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900">Step 1 — Netkeiba URL を入力</h2>
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://race.netkeiba.com/race/shutuba.html?race_id=... (地方: nar.netkeiba.com)"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFetch();
            }}
          />
          <Button onClick={handleFetch} disabled={isPendingFetch || !url.trim()}>
            {isPendingFetch ? '取得中...' : '解析'}
          </Button>
        </div>
        {fetchError && <p className="text-sm text-red-600">{fetchError}</p>}
      </Card>

      {preview && (
        <>
          <Card className="space-y-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Step 2 — レース情報確認・編集</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="raceName">レース名</Label>
                <Input id="raceName" value={raceName} onChange={(e) => setRaceName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="raceDate">開催日</Label>
                <Input id="raceDate" type="date" value={raceDate} onChange={(e) => setRaceDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="venueId">競馬場</Label>
                <Select id="venueId" value={venueId} onChange={(e) => setVenueId(e.target.value)}>
                  <option value="">-- 競馬場を選択 --</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                      {v.code ? ` (${v.code})` : ''}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="eventId">イベント</Label>
                <Select id="eventId" value={eventId} onChange={(e) => setEventId(e.target.value)}>
                  <option value="">-- イベントを選択 --</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.date})
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
              <span>{preview.raceInfo.raceNumber}R</span>
              <span>•</span>
              <span>{preview.raceInfo.distance}m</span>
              <span>•</span>
              <span>{preview.raceInfo.surface}</span>
              {preview.raceInfo.direction && (
                <>
                  <span>•</span>
                  <span>{preview.raceInfo.direction === 'RIGHT' ? '右回り' : '左回り'}</span>
                </>
              )}
              {preview.raceInfo.condition && (
                <>
                  <span>•</span>
                  <span>馬場: {preview.raceInfo.condition}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="fixedOddsMode" checked={fixedOddsMode} onCheckedChange={setFixedOddsMode} />
              <label htmlFor="fixedOddsMode" className="cursor-pointer text-sm font-medium text-gray-700">
                固定オッズモードで登録（Netkeibaオッズで払戻）
              </label>
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900">出走馬一覧（{preview.horses.length}頭）</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-sm font-semibold text-gray-500 uppercase">
                    <th className="px-2 py-2">枠</th>
                    <th className="px-2 py-2">馬番</th>
                    <th className="px-2 py-2">馬名</th>
                    <th className="px-2 py-2">性齢</th>
                    <th className="px-2 py-2">騎手</th>
                    <th className="px-2 py-2">斤量</th>
                    <th className="px-2 py-2">予想オッズ</th>
                    <th className="px-2 py-2">状態</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.horses.map((h) => (
                    <tr key={h.name} className="border-b last:border-0">
                      <td className="px-2 py-1.5">{h.bracketNumber}</td>
                      <td className="px-2 py-1.5">{h.horseNumber}</td>
                      <td className="px-2 py-1.5 font-medium">{h.name}</td>
                      <td className="px-2 py-1.5">
                        {GENDER_LABELS[h.gender] ?? h.gender}
                        {h.age}
                      </td>
                      <td className="px-2 py-1.5">{h.jockey ?? '-'}</td>
                      <td className="px-2 py-1.5">{h.weight?.toFixed(1) ?? '-'}</td>
                      <td className="px-2 py-1.5">{h.odds?.toFixed(1) ?? '-'}</td>
                      <td className="px-2 py-1.5">
                        {h.existingHorseId ? (
                          <Badge label="既存" className="bg-blue-100 text-blue-700" />
                        ) : (
                          <Badge label="新規" className="bg-green-100 text-green-700" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleImport}
                disabled={isPendingImport}
                className="from-primary to-primary/80 bg-linear-to-r"
              >
                {isPendingImport ? 'インポート中...' : 'インポート確定'}
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
