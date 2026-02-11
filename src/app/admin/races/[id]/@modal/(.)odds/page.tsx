import { RaceGuaranteedOddsForm } from '@/features/admin/manage-races/ui/race-guaranteed-odds-form';
import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { raceInstances } from '@/shared/db/schema';
import { DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { InterceptDialog } from '@/shared/ui/intercept-dialog';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

export default async function RaceOddsModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  const race = await db.query.raceInstances.findFirst({
    where: eq(raceInstances.id, id),
    columns: {
      id: true,
      guaranteedOdds: true,
      name: true,
    },
  });

  if (!race) return notFound();

  return (
    <InterceptDialog>
      <DialogHeader>
        <DialogTitle>保証オッズ設定</DialogTitle>
        <DialogDescription>{race.name}</DialogDescription>
      </DialogHeader>
      <RaceGuaranteedOddsForm
        raceId={race.id}
        initialOdds={race.guaranteedOdds as Record<string, number>}
        hideHeader={true}
      />
    </InterceptDialog>
  );
}
