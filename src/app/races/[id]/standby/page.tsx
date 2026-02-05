import { getEntriesForRace, getRaceById } from '@/features/admin/manage-entries/actions';
import { getPayoutResults } from '@/features/admin/manage-races/actions';
import { getUserBetsForRace } from '@/features/betting/actions';
import { PurchasedTicketList } from '@/features/betting/ui/purchased-ticket-list';
import { auth } from '@/shared/config/auth';
import { BetDetail, BetType } from '@/types/betting';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { StandbyClient } from './standby-client';

interface Entry {
  id: string;
  horseId: string;
  bracketNumber: number | null;
  horseNumber: number | null;
  horseName: string;
  horseGender: string;
  horseAge: number | null;
  finishPosition: number | null;
}

interface ClientPayoutResult {
  type: BetType;
  combinations: {
    numbers: number[];
    payout: number;
    popularity?: number;
  }[];
}

export default async function RaceStandbyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const [race, entriesData, userBets] = await Promise.all([
    getRaceById(id),
    getEntriesForRace(id),
    getUserBetsForRace(id),
  ]);
  const entries = entriesData as unknown as Entry[];

  if (!race) {
    notFound();
  }

  const isFinalized = race.status === 'FINALIZED';

  let initialResults: ClientPayoutResult[] = [];
  if (isFinalized) {
    const rawResults = await getPayoutResults(id);
    initialResults = rawResults.map((r) => ({
      type: r.type as BetType,
      combinations: r.combinations as { numbers: number[]; payout: number }[],
    }));
  }

  const tickets = userBets.map((bet) => {
    const details = bet.details as BetDetail;
    return {
      id: bet.id,
      type: details.type,
      amount: bet.amount,
      status: bet.status,
      payout: bet.payout ?? undefined,
      odds: bet.odds ?? undefined,
      createdAt: bet.createdAt,
      selections: details.selections.map((num: number) => {
        const entry = entries.find((e: Entry) => e.horseNumber === num);
        return {
          horseNumber: num,
          horseName: entry?.horseName || '不明',
          horseGender: entry?.horseGender || '不明',
          horseAge: entry?.horseAge || 0,
        };
      }),
    };
  });

  return (
    <div className="flex flex-col items-center p-4 lg:p-8">
      <div className="w-full max-w-5xl space-y-8">
        <Link
          href={`/races/${id}`}
          className="mb-6 flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft size={16} />
          レース画面へ戻る
        </Link>

        <StandbyClient
          race={{
            ...race,
            location: race.location ?? '',
            closingAt: race.closingAt,
          }}
          isFinalized={isFinalized}
          initialResults={initialResults}
          hasTickets={tickets.length > 0}
          entryCount={entries.length}
        />

        <PurchasedTicketList tickets={tickets} />
      </div>
    </div>
  );
}
