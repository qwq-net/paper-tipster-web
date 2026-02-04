import { Badge } from '@/shared/ui';
import { getGenderAge } from '@/shared/utils/gender';
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
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full min-w-[700px] border-collapse">
        <thead className="bg-gray-50">
          <tr className="border-b border-gray-100">
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              馬名
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
              <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap text-gray-900">{horse.name}</td>
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
