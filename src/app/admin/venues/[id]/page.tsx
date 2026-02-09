import { getVenue } from '@/features/admin/manage-venues/actions';
import { VenueForm } from '@/features/admin/manage-venues/ui/venue-form';
import { Card } from '@/shared/ui';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function EditVenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const venue = await getVenue(id);

  async function onSuccess() {
    'use server';
    redirect('/admin/venues');
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/venues"
          className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft size={16} />
          一覧へ戻る
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">会場情報の編集</h1>
        <p className="mt-1 text-gray-500">会場情報を編集します。</p>
      </div>

      <Card className="p-6">
        <VenueForm
          initialData={{
            ...venue,
            code: venue.code || undefined,
            direction: venue.defaultDirection as 'LEFT' | 'RIGHT' | 'STRAIGHT',
            area: venue.area as 'EAST_JAPAN' | 'WEST_JAPAN' | 'OVERSEAS',
          }}
          onSuccess={onSuccess}
        />
      </Card>
    </div>
  );
}
