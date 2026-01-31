import { getHorses } from '../actions';
import { DeleteHorseButton } from './delete-horse-button';
import { EditHorseDialog } from './edit-horse-dialog';

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
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">馬名</th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">産地</th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">性別</th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">年齢</th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">備考</th>
            <th className="w-28 px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600 uppercase">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {horses.map((horse) => (
            <tr key={horse.id} className="transition-colors hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{horse.name}</td>
              <td className="px-4 py-3 text-sm text-gray-600">
                <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700">
                  {originLabels[horse.origin] || '不明'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    horse.gender === '牡'
                      ? 'bg-blue-100 text-blue-800'
                      : horse.gender === '牝'
                        ? 'bg-pink-100 text-pink-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {horse.gender}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{horse.age ? `${horse.age}歳` : '-'}</td>
              <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-500" title={horse.notes || ''}>
                {horse.notes || '-'}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end">
                  <EditHorseDialog
                    horse={{
                      ...horse,
                      gender: horse.gender as '牡' | '牝' | 'セン',
                    }}
                  />
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
