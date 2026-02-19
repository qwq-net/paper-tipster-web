import { getBet5AdminData } from '@/features/admin/bet5/queries';
import { Bet5ConfigForm } from '@/features/admin/bet5/ui/bet5-config-form';
import { Bet5ManageCard } from '@/features/admin/bet5/ui/bet5-manage-card';
import { Bet5TicketList } from '@/features/admin/bet5/ui/bet5-ticket-list';
import { getBet5TicketsAction } from '@/features/betting/actions/bet5';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function Bet5AdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const adminData = await getBet5AdminData(id);

  if (!adminData) {
    notFound();
  }

  const { event, races, bet5Event, horseMap } = adminData;

  let tickets: Awaited<ReturnType<typeof getBet5TicketsAction>> = [];

  if (bet5Event) {
    tickets = await getBet5TicketsAction(bet5Event.id);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <Link
          href={`/admin/events/${id}`}
          className="mb-4 inline-flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          イベント編集に戻る
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">BET5 管理</h1>
        <p className="mt-1 text-base text-gray-500">{event.name} のBET5設定と購入状況</p>
      </div>

      {!bet5Event ? (
        <Bet5ConfigForm eventId={id} races={races.map((r) => ({ id: r.id, raceNumber: r.raceNumber, name: r.name }))} />
      ) : (
        <div className="space-y-8">
          <Bet5ManageCard bet5Event={bet5Event} eventId={id} />
          <div className="border-t border-gray-100 pt-8">
            <Bet5TicketList tickets={tickets} horseMap={horseMap} isFinalized={bet5Event.status === 'FINALIZED'} />
          </div>
        </div>
      )}
    </div>
  );
}
