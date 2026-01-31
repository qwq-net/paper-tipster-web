import { getRaces } from '../actions';

export async function RaceList() {
  const races = await getRaces();

  if (races.length === 0) {
    return <div className="py-12 text-center text-gray-500">登録されているレースはありません</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">開催日</th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">場所</th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
              レース名
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">距離</th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">馬場</th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">状態</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {races.map((race) => (
            <tr key={race.id} className="transition-colors hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">{race.date.replace(/-/g, '/')}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{race.location}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{race.name}</td>
              <td className="px-4 py-3 text-sm text-gray-600">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    race.surface === '芝' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {race.surface}
                </span>
                <span className="ml-1">{race.distance}m</span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {race.condition ? (
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      race.condition === '良'
                        ? 'bg-sky-100 text-sky-800'
                        : race.condition === '稍重'
                          ? 'bg-cyan-100 text-cyan-800'
                          : race.condition === '重'
                            ? 'bg-slate-200 text-slate-800'
                            : 'bg-gray-300 text-gray-800'
                    }`}
                  >
                    {race.condition}
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    race.status === 'SCHEDULED'
                      ? 'bg-blue-100 text-blue-800'
                      : race.status === 'CLOSED'
                        ? 'bg-yellow-100 text-yellow-800'
                        : race.status === 'FINALIZED'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                  }`}
                >
                  {race.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
