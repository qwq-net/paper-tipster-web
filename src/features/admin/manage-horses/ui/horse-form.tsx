'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { createHorse } from '../actions';

export function HorseForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [gender, setGender] = useState('牡');

  async function handleSubmit(formData: FormData) {
    try {
      await createHorse(formData);
      formRef.current?.reset();
      setGender('牡');
      toast.success('馬を登録しました');
    } catch (error) {
      console.error(error);
      toast.error('登録に失敗しました');
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
                  onChange={(e) => setGender(e.target.value)}
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
            className="focus:ring-primary/20 focus:border-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition-all focus:ring-2 focus:outline-none"
            placeholder="例: 4"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          備考 <span className="font-normal text-gray-400">(任意)</span>
        </label>
        <textarea
          name="notes"
          rows={3}
          className="focus:ring-primary/20 focus:border-primary w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm transition-all focus:ring-2 focus:outline-none"
          placeholder="馬の特徴や評価など"
        />
      </div>

      <button
        type="submit"
        className="from-primary to-primary/80 hover:to-primary w-full rounded-md bg-linear-to-r px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
      >
        登録する
      </button>
    </form>
  );
}
