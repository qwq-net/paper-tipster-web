import { getHorses } from '../actions';

export async function HorseList() {
  const horses = await getHorses();

  if (horses.length === 0) {
    return <div className="py-12 text-center text-gray-500">登録されている馬はありません</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">馬名</th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">性別</th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">年齢</th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">備考</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {horses.map((horse) => (
            <tr key={horse.id} className="transition-colors hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{horse.name}</td>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
