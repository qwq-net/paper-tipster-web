import { Badge } from '@/shared/ui';
import { getGenderAge } from '@/shared/utils/gender';
import Link from 'next/link';
import { getHorses } from '../actions';
import { DeleteHorseButton } from './delete-horse-button';

export async function HorseList() {
  const horses = await getHorses();

  if (horses.length === 0) {
    return <div className="py-12 text-center text-gray-500">登録されている馬はありません</div>;
  }

  const originLabels: Record<string, string> = {
    DOMESTIC: '日本産',
    FOREIGN_BRED: '外国産',
    FOREIGN_TRAINED: '外来馬',
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full min-w-[700px] border-collapse">
        <thead className="bg-gray-50">
          <tr className="border-b border-gray-100">
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              馬名/種別
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              タグ
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              産地
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              性齢
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              備考
            </th>
            <th className="w-32 px-6 py-4 text-right text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {horses.map((horse) => (
            <tr key={horse.id} className="transition-colors hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap text-gray-900">
                <div className="flex items-center gap-2">
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-sm font-medium ${
                      horse.type === 'REAL' ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'
                    }`}
                  >
                    {horse.type === 'REAL' ? '実在' : '架空'}
                  </span>
                  <Link
                    href={`/admin/horses/${horse.id}`}
                    className="text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                  >
                    {horse.name}
                  </Link>
                </div>
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap">
                <div className="flex max-w-[200px] flex-wrap gap-1">
                  {horse.tags.length > 0 ? (
                    horse.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex origin-left scale-90 items-center rounded-sm bg-gray-100 px-1.5 py-0.5 text-sm font-medium text-gray-600"
                      >
                        {tag.content}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap">
                <Badge label={originLabels[horse.origin] || '不明'} variant="origin" />
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap">
                <Badge label={getGenderAge(horse.gender, horse.age)} variant="gender" />
              </td>
              <td
                className="max-w-[200px] truncate px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-500"
                title={horse.notes || ''}
              >
                {horse.notes || '-'}
              </td>
              <td className="px-6 py-4 text-right whitespace-nowrap">
                <div className="flex justify-end gap-2">
                  <DeleteHorseButton horseId={horse.id} horseName={horse.name} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
