import { getEvent } from '@/features/admin/manage-events/actions';
import { AdminRankingManager } from '@/features/admin/manage-events/ui/admin-ranking-manager';
import { getAdminEventRanking } from '@/features/ranking/actions';
import { notFound } from 'next/navigation';

interface AdminRankingPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminRankingPage({ params }: AdminRankingPageProps) {
  const { id } = await params;

  const [event, rankingData] = await Promise.all([getEvent(id), getAdminEventRanking(id)]);

  if (!event) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <AdminRankingManager
        eventId={event.id}
        eventName={event.name}
        initialRanking={rankingData.ranking}
        initialDisplayMode={rankingData.displayMode}
        distributeAmount={rankingData.distributeAmount}
      />
    </div>
  );
}
