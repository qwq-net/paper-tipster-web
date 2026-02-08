import { getHorse, getHorseWins } from '@/features/admin/manage-horses/actions';
import { HorseDetail } from '@/features/admin/manage-horses/ui/horse-detail';
import { Button } from '@/shared/ui';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: '馬詳細編集',
};

export default async function HorseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let horse;
  let wins;

  try {
    [horse, wins] = await Promise.all([getHorse(id), getHorseWins(id)]);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/horses">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-gray-900">馬詳細</h1>
          <p className="text-sm text-gray-500">競走馬の詳細情報と戦績</p>
        </div>
      </div>

      <HorseDetail horse={horse} wins={wins} />
    </div>
  );
}
