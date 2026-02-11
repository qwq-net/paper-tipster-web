'use client';

import { GuaranteedOddsInputs } from '@/features/admin/shared/ui/guaranteed-odds-inputs';
import { Button, Input, Label, Textarea } from '@/shared/ui';
import { Calendar } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { createEvent, updateEvent } from '../actions';

interface EventFormProps {
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    distributeAmount: number;
    date: string;
    defaultGuaranteedOdds?: Record<string, number> | null;
  };
  onSuccess?: () => void;
}

export function EventForm({ initialData, onSuccess }: EventFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [guaranteedOdds, setGuaranteedOdds] = useState<Record<string, number>>(
    initialData?.defaultGuaranteedOdds || {}
  );

  async function handleSubmit(formData: FormData) {
    try {
      if (initialData) {
        await updateEvent(initialData.id, formData);
        toast.success('イベント情報を更新しました');
      } else {
        await createEvent(formData);
        formRef.current?.reset();
        setDate(new Date().toISOString().split('T')[0]);
        toast.success('イベントを作成しました');
      }
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(initialData ? '更新に失敗しました' : '作成に失敗しました');
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-5">
      <div>
        <Label>イベント名</Label>
        <Input name="name" required defaultValue={initialData?.name} placeholder="例: 第1回 拠り所杯" />
      </div>

      <div>
        <Label>説明 (任意)</Label>
        <Textarea
          name="description"
          defaultValue={initialData?.description || ''}
          rows={3}
          placeholder="イベントの詳細や説明を入力"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>配布金額</Label>
          <div className="relative">
            <Input
              name="distributeAmount"
              type="number"
              required
              defaultValue={initialData?.distributeAmount ?? 100000}
              className="pr-8"
            />
            <span className="absolute top-2 right-3 text-sm text-gray-400">円</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">初期資金として配布されます</p>
        </div>

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
      </div>

      <div className="border-t border-gray-100 pt-4">
        <Label>デフォルト保証オッズ</Label>
        <p className="mt-1 mb-3 text-sm text-gray-500">
          レース作成時に適用される保証オッズの初期値です。各レースで個別に変更可能です。
        </p>
        <input name="defaultGuaranteedOdds" type="hidden" value={JSON.stringify(guaranteedOdds)} />
        <GuaranteedOddsInputs value={guaranteedOdds} onChange={setGuaranteedOdds} />
      </div>

      <Button type="submit" className="mt-2 w-full" size="lg">
        {initialData ? 'イベント更新' : 'イベント作成'}
      </Button>
    </form>
  );
}
