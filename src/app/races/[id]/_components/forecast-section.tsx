import { getEntriesForRace } from '@/features/admin/manage-entries/actions';
import { getForecastsByRaceId } from '@/features/forecasts/actions';
import { ForecastDisplay } from '@/features/forecasts/components/ForecastDisplay';

interface ForecastSectionProps {
  raceId: string;
}

export async function ForecastSection({ raceId }: ForecastSectionProps) {
  const [forecasts, entries] = await Promise.all([getForecastsByRaceId(raceId), getEntriesForRace(raceId)]);

  return <ForecastDisplay forecasts={forecasts} entries={entries} />;
}
