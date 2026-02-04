'use client';

import { useIsMounted } from '@/shared/hooks/use-is-mounted';
import { RaceCondition, RaceSurface } from '@/shared/types/race';
import { Badge } from '@/shared/ui';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { EditRaceDialog } from './edit-race-dialog';

interface RaceAccordionProps {
  events: Array<{
    id: string;
    name: string;
    date: string;
    status: string;
    races: Array<{
      id: string;
      name: string;
      raceNumber: number | null;
      location: string;
      distance: number;
      surface: string;
      condition: string | null;
      status: string;
      closingAt: Date | null;
    }>;
  }>;
  allEvents: Array<{ id: string; name: string; date: string }>;
}

const STORAGE_KEY = 'race-accordion-open-items';

export function RaceAccordion({ events, allEvents }: RaceAccordionProps) {
  const isMounted = useIsMounted();
  const [openItems, setOpenItems] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => setOpenItems(parsed), 0);
      } catch (e) {
        console.error('Failed to parse saved accordion state', e);
      }
    }
  }, []);

  const handleValueChange = (value: string[]) => {
    setOpenItems(value);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  };

  if (!isMounted) {
    return null;
  }

  if (events.length === 0) {
    return <div className="py-12 text-center text-gray-500">登録されているレースはありません</div>;
  }

  return (
    <Accordion.Root type="multiple" className="w-full" value={openItems} onValueChange={handleValueChange}>
      {events.map((event) => (
        <Accordion.Item key={event.id} value={event.id} className="border-b border-gray-200 last:border-b-0">
          <Accordion.Trigger className="group flex w-full items-center justify-between bg-gray-50 px-6 py-4 text-left transition-colors hover:bg-gray-100">
            <div className="flex items-center gap-4">
              <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                <p className="text-sm text-gray-500">{event.date}</p>
              </div>
            </div>
            <Badge variant="status" label={event.status} />
          </Accordion.Trigger>

          <Accordion.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden bg-white">
            <div className="border-t border-gray-100">
              {event.races.length === 0 ? (
                <div className="py-8 text-center text-gray-500">このイベントにレースはありません</div>
              ) : (
                <table className="w-full min-w-[800px] border-collapse">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-3 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
                        番号
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
                        レース名
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
                        場所
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
                        距離
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
                        馬場
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
                        状態
                      </th>
                      <th className="w-20 px-6 py-3 text-right text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
                        編集
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {event.races.map((race) => (
                      <tr key={race.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                          {race.raceNumber ? `${race.raceNumber}R` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                          <Link
                            href={`/admin/races/${race.id}`}
                            className="text-primary hover:text-primary-hover font-semibold hover:underline"
                          >
                            {race.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{race.location}</td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{race.distance}m</td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          {race.surface} {race.condition || ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="status" label={race.status} />
                        </td>
                        <td className="px-6 py-4 text-right text-sm whitespace-nowrap">
                          <EditRaceDialog
                            race={{
                              id: race.id,
                              eventId: event.id,
                              date: event.date,
                              location: race.location,
                              name: race.name,
                              raceNumber: race.raceNumber,
                              distance: race.distance,
                              surface: race.surface as RaceSurface,
                              condition: race.condition as RaceCondition | null,
                            }}
                            events={allEvents}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
