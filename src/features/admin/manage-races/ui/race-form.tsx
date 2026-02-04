'use client';

import { Button, Input, Label, Select } from '@/shared/ui';
import { toJSTString } from '@/shared/utils/date';
import { Calendar } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { createRace, updateRace } from '../actions';

interface RaceFormProps {
  initialData?: {
    id: string;
    eventId: string;
    date: string;
    location: string;
    name: string;
    raceNumber?: number | null;
    distance: number;
    surface: '芝' | 'ダート';
    condition: '良' | '稍重' | '重' | '不良' | null;
    closingAt?: Date | string | null;
  };
  events: Array<{ id: string; name: string; date: string }>;
  onSuccess?: () => void;
  showClosingAt?: boolean;
}

export function RaceForm({ initialData, events, onSuccess, showClosingAt = false }: RaceFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [eventId, setEventId] = useState(initialData?.eventId || events[0]?.id || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [surface, setSurface] = useState(initialData?.surface || '芝');
  const [condition, setCondition] = useState(initialData?.condition || '良');
  const [closingAt, setClosingAt] = useState(toJSTString(initialData?.closingAt));

  async function handleSubmit(formData: FormData) {
    try {
      if (initialData) {
        await updateRace(initialData.id, formData);
        toast.success('レース情報を更新しました');
      } else {
        await createRace(formData);
        formRef.current?.reset();
        setEventId(events[0]?.id || '');
        setDate(new Date().toISOString().split('T')[0]);
        setSurface('芝');
        setCondition('良');
        toast.success('レースを登録しました');
      }
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(initialData ? '更新に失敗しました' : '登録に失敗しました');
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-5">
      <div>
        <Label>イベント</Label>
        <Select name="eventId" required value={eventId} onChange={(e) => setEventId(e.target.value)}>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.date} - {event.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>開催日</Label>
          <div className="relative">
            <div className="focus-within:ring-primary/20 focus-within:border-primary flex w-full items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-all focus-within:ring-2 focus-within:outline-none">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{date.replace(/-/g, '/')}</span>
            </div>
            <input
              name="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>
        </div>

        <div>
          <Label>開催場所</Label>
          <div className="relative">
            <Input
              name="location"
              type="text"
              required
              defaultValue={initialData?.location}
              className="pl-9"
              placeholder="例: 東京"
            />
          </div>
        </div>
      </div>

      <div>
        <Label>レース名</Label>
        <Input name="name" type="text" required defaultValue={initialData?.name} placeholder="例: ジャパンカップ" />
      </div>

      <div>
        <Label>レース番号（省略可）</Label>
        <Input
          name="raceNumber"
          type="number"
          min="1"
          defaultValue={initialData?.raceNumber || ''}
          placeholder="自動採番"
        />
        <p className="mt-1 text-sm text-gray-500">未入力の場合は自動で採番されます</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>距離 (m)</Label>
          <Input
            name="distance"
            type="number"
            min="100"
            required
            defaultValue={initialData?.distance}
            placeholder="2400"
          />
        </div>

        <div>
          <Label>コース</Label>
          <div className="flex gap-2">
            {['芝', 'ダート'].map((s) => (
              <label
                key={s}
                className={`flex flex-1 cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-all ${
                  surface === s
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="surface"
                  value={s}
                  checked={surface === s}
                  onChange={(e) => setSurface(e.target.value as '芝' | 'ダート')}
                  className="sr-only"
                />
                {s}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div>
        <Label>馬場状態</Label>
        <div className="flex gap-2">
          {['良', '稍重', '重', '不良'].map((c) => (
            <label
              key={c}
              className={`flex flex-1 cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-all ${
                condition === c
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                name="condition"
                value={c}
                checked={condition === c}
                onChange={(e) => setCondition(e.target.value as '良' | '稍重' | '重' | '不良')}
                className="sr-only"
              />
              {c}
            </label>
          ))}
        </div>
      </div>

      {showClosingAt && (
        <div>
          <Label>受付終了時刻</Label>
          <div className="relative">
            <Input
              name="closingAt"
              type="datetime-local"
              value={closingAt}
              onChange={(e) => setClosingAt(e.target.value)}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            設定した時間になると自動的に投票が締め切られます。未設定の場合は手動での締め切りが必要です。
          </p>
        </div>
      )}

      <Button
        type="submit"
        className="from-primary to-primary/80 hover:to-primary w-full bg-linear-to-r shadow-md transition-all hover:shadow-lg"
      >
        {initialData ? '更新する' : '登録する'}
      </Button>
    </form>
  );
}
