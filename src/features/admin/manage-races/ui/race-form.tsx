'use client';

import { Calendar, MapPin } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { createRace, updateRace } from '../actions';

interface RaceFormProps {
  initialData?: {
    id: string;
    date: string;
    location: string;
    name: string;
    distance: number;
    surface: '芝' | 'ダート';
    condition: '良' | '稍重' | '重' | '不良' | null;
  };
  onSuccess?: () => void;
}

export function RaceForm({ initialData, onSuccess }: RaceFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [surface, setSurface] = useState(initialData?.surface || '芝');
  const [condition, setCondition] = useState(initialData?.condition || '良');

  async function handleSubmit(formData: FormData) {
    try {
      if (initialData) {
        await updateRace(initialData.id, formData);
        toast.success('レース情報を更新しました');
      } else {
        await createRace(formData);
        formRef.current?.reset();
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">開催日</label>
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
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">開催場所</label>
          <div className="relative">
            <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              name="location"
              type="text"
              required
              defaultValue={initialData?.location}
              className="focus:ring-primary/20 focus:border-primary w-full rounded-md border border-gray-300 py-2 pr-3 pl-9 text-sm transition-all focus:ring-2 focus:outline-none"
              placeholder="例: 東京"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">レース名</label>
        <input
          name="name"
          type="text"
          required
          defaultValue={initialData?.name}
          className="focus:ring-primary/20 focus:border-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition-all focus:ring-2 focus:outline-none"
          placeholder="例: ジャパンカップ"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">距離 (m)</label>
          <input
            name="distance"
            type="number"
            min="100"
            required
            defaultValue={initialData?.distance}
            className="focus:ring-primary/20 focus:border-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition-all focus:ring-2 focus:outline-none"
            placeholder="2400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">コース</label>
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
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">馬場状態</label>
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

      <button
        type="submit"
        className="from-primary to-primary/80 hover:to-primary w-full rounded-md bg-linear-to-r px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
      >
        {initialData ? '更新する' : '登録する'}
      </button>
    </form>
  );
}
