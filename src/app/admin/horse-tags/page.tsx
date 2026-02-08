import { HorseTagList } from '@/features/admin/manage-horse-tags/ui/horse-tag-list';
import { db } from '@/shared/db';
import type { HorseTagType } from '@/shared/types/horse';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '馬タグ管理',
};

export default async function HorseTagsPage() {
  const tags = await db.query.horseTagMaster.findMany({
    orderBy: (t, { asc }) => [asc(t.type), asc(t.content)],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">馬タグ管理</h1>
        <p className="text-gray-500">馬の詳細情報に使用するタグ（脚質、特性、来歴など）を管理します。</p>
      </div>

      <HorseTagList tags={tags as { id: string; type: HorseTagType; content: string }[]} />
    </div>
  );
}
