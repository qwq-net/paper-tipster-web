import Link from 'next/link';
import { getRaceDefinitions } from '../actions';
import { DeleteRaceDefinitionButton } from './delete-race-definition-button';

const GRADE_LABELS: Record<string, string> = {
  G1: 'G1',
  G2: 'G2',
  G3: 'G3',
  L: 'L',
  OP: 'OP',
  '3_WIN': '3勝',
  '2_WIN': '2勝',
  '1_WIN': '1勝',
  MAIDEN: '未',
  NEWCOMER: '新',
};

const DIRECTION_LABELS: Record<string, string> = {
  LEFT: '左',
  RIGHT: '右',
  STRAIGHT: '直',
};

export async function RaceDefinitionList() {
  const definitions = await getRaceDefinitions();

  if (definitions.length === 0) {
    return <div className="py-12 text-center text-gray-500">登録されているレース定義はありません</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full min-w-[800px] border-collapse">
        <thead className="bg-gray-50">
          <tr className="border-b border-gray-100">
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              レース名
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              種別
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              格付け
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              コース詳細 (場所 / 距離 / 馬場)
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              方向
            </th>
            <th className="w-32 px-6 py-4 text-right text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {definitions.map((def) => (
            <tr key={def.id} className="transition-colors hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap">
                <Link
                  href={`/admin/race-definitions/${def.id}`}
                  className="text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                >
                  {def.name}
                </Link>
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ring-1 ring-inset ${
                    def.type === 'REAL'
                      ? 'bg-green-50 text-green-700 ring-green-700/10'
                      : 'bg-purple-50 text-purple-700 ring-purple-700/10'
                  }`}
                >
                  {def.type === 'REAL' ? '実在' : '架空'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ring-1 ring-inset ${
                    def.grade.startsWith('G')
                      ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                      : 'bg-gray-50 text-gray-600 ring-gray-500/10'
                  }`}
                >
                  {GRADE_LABELS[def.grade] || def.grade}
                </span>
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                {def.defaultVenue.shortName} / {def.defaultDistance}m / {def.defaultSurface}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                {DIRECTION_LABELS[def.defaultDirection] || def.defaultDirection}
              </td>
              <td className="px-6 py-4 text-right whitespace-nowrap">
                <div className="flex justify-end gap-2">
                  <DeleteRaceDefinitionButton id={def.id} name={def.name} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
