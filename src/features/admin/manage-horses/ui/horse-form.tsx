'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { createHorse, updateHorse } from '../actions';

interface HorseFormProps {
  initialData?: {
    id: string;
    name: string;
    gender: '牡' | '牝' | 'セン';
    age: number | null;
    origin: 'DOMESTIC' | 'FOREIGN_BRED' | 'FOREIGN_TRAINED';
    notes: string | null;
  };
  onSuccess?: () => void;
}

export function HorseForm({ initialData, onSuccess }: HorseFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [gender, setGender] = useState(initialData?.gender || '牡');

  async function handleSubmit(formData: FormData) {
    try {
      if (initialData) {
        await updateHorse(initialData.id, formData);
        toast.success('馬情報を更新しました');
      } else {
        await createHorse(formData);
        formRef.current?.reset();
        setGender('牡');
        toast.success('馬を登録しました');
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
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">馬名</label>
        <input
          name="name"
          type="text"
          required
          defaultValue={initialData?.name}
          className="focus:ring-primary/20 focus:border-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition-all focus:ring-2 focus:outline-none"
          placeholder="例: ディープインパクト"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">性別</label>
          <div className="flex gap-2">
            {['牡', '牝', 'セン'].map((g) => (
              <label
                key={g}
                className={`flex flex-1 cursor-pointer items-center justify-center rounded-md border px-2 py-2 text-sm font-medium transition-all ${
                  gender === g
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={(e) => setGender(e.target.value as '牡' | '牝' | 'セン')}
                  className="sr-only"
                />
                {g}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            年齢 <span className="font-normal text-gray-400">(任意)</span>
          </label>
          <input
            name="age"
            type="number"
            min="2"
            max="20"
            defaultValue={initialData?.age ?? ''}
            className="focus:ring-primary/20 focus:border-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition-all focus:ring-2 focus:outline-none"
            placeholder="例: 4"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">産地</label>
        <select
          name="origin"
          required
          defaultValue={initialData?.origin || 'DOMESTIC'}
          className="focus:ring-primary/20 focus:border-primary w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-all focus:ring-2 focus:outline-none"
        >
          <option value="DOMESTIC">日本産</option>
          <option value="FOREIGN_BRED">外国産</option>
          <option value="FOREIGN_TRAINED">外来馬</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          備考 <span className="font-normal text-gray-400">(任意)</span>
        </label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={initialData?.notes ?? ''}
          className="focus:ring-primary/20 focus:border-primary w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm transition-all focus:ring-2 focus:outline-none"
          placeholder="馬の特徴や評価など"
        />
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
