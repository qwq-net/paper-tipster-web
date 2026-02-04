'use client';

import { Input } from '@/shared/ui';
import { Ban, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { generateGuestCode, invalidateGuestCode, invalidateUsersByCode } from '../actions/guest-actions';

type GuestCode = {
  code: string;
  title: string;
  createdBy: string;
  disabledAt: Date | null;
  createdAt: Date;
  creator?: {
    name: string | null;
  };
};

export function GuestCodeManager({ codes }: { codes: GuestCode[] }) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [title, setTitle] = useState('');

  const handleGenerate = async () => {
    if (!title) return;
    setIsGenerating(true);
    try {
      await generateGuestCode(title);
      setTitle('');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('コード生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInvalidateCode = async (code: string) => {
    if (!confirm('このコードを無効化してもよろしいですか？新規登録ができなくなります。')) return;
    try {
      await invalidateGuestCode(code);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('コードの無効化に失敗しました');
    }
  };

  const handleInvalidateUsers = async (code: string) => {
    if (!confirm('危険: このコードで登録した全てのユーザーを凍結します。本当によろしいですか？')) return;
    try {
      await invalidateUsersByCode(code);
      alert('このコードに関連する全てのユーザーを凍結しました。');
    } catch (error) {
      console.error(error);
      alert('ユーザーの凍結に失敗しました');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">新規ゲストコード発行</h3>
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="イベント名や用途など識別可能な言葉を入力してください"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="max-w-lg"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !title}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isGenerating ? '発行中...' : 'コード発行'}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium tracking-wider text-gray-500 uppercase"
                >
                  コード
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium tracking-wider text-gray-500 uppercase"
                >
                  タイトル
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium tracking-wider text-gray-500 uppercase"
                >
                  作成者
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium tracking-wider text-gray-500 uppercase"
                >
                  作成日
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium tracking-wider text-gray-500 uppercase"
                >
                  ステータス
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-sm font-medium tracking-wider text-gray-500 uppercase"
                >
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {codes.map((code) => (
                <tr key={code.code} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-mono text-sm font-bold whitespace-nowrap text-gray-900">{code.code}</td>
                  <td className="max-w-[200px] truncate px-6 py-4 text-sm text-gray-900" title={code.title}>
                    {code.title}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{code.creator?.name || '不明'}</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {new Date(code.createdAt).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {code.disabledAt ? (
                      <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-sm font-medium text-red-700 ring-1 ring-red-600/10 ring-inset">
                        無効
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                        有効
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleInvalidateUsers(code.code)}
                        className="inline-flex items-center rounded p-1.5 text-red-600 transition-colors hover:bg-red-50 hover:text-red-900"
                        title="このコードの全ユーザーを凍結"
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                      {!code.disabledAt && (
                        <button
                          onClick={() => handleInvalidateCode(code.code)}
                          className="inline-flex items-center rounded p-1.5 text-orange-600 transition-colors hover:bg-orange-50 hover:text-orange-900"
                          title="コード無効化"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
