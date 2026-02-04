'use client';

import { Badge, Button, Input } from '@/shared/ui';
import { FormattedDate } from '@/shared/ui/formatted-date';
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
          <Button onClick={handleGenerate} disabled={isGenerating || !title} className="shadow-sm disabled:opacity-50">
            {isGenerating ? '発行中...' : 'コード発行'}
          </Button>
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
                  <td className="px-6 py-4 font-mono text-sm font-semibold whitespace-nowrap text-gray-900">
                    {code.code}
                  </td>
                  <td className="max-w-[200px] truncate px-6 py-4 text-sm text-gray-900" title={code.title}>
                    {code.title}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{code.creator?.name || '不明'}</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    <FormattedDate date={code.createdAt} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {code.disabledAt ? (
                      <Badge variant="status" label="無効" />
                    ) : (
                      <Badge variant="status" label="有効" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleInvalidateUsers(code.code)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-900"
                        title="このコードの全ユーザーを凍結"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                      {!code.disabledAt && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleInvalidateCode(code.code)}
                          className="text-orange-600 hover:bg-orange-50 hover:text-orange-900"
                          title="コード無効化"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
