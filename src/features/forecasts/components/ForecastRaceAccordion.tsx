'use client';

import { useIsMounted } from '@/shared/hooks/use-is-mounted';
import { Badge, Button } from '@/shared/ui';
import { getDisplayStatus } from '@/shared/utils/race-status';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ForecastRaceAccordionProps {
  events: Array<{
    id: string;
    name: string;
    date: string;
    status: string;
    races: Array<{
      id: string;
      name: string;
      raceNumber: number | null;
      distance: number;
      surface: string;
      condition: string | null;
      status: string;
      closingAt: Date | null;
      entries?: Array<{ finishPosition: number | null }>;
      venueId?: string;
      raceDefinitionId?: string | null;
      direction?: string | null;
      venue?: {
        name: string;
      };
    }>;
  }>;
}

const STORAGE_KEY = 'forecast-race-accordion-open-items_v2';

export function ForecastRaceAccordion({ events }: ForecastRaceAccordionProps) {
  const isMounted = useIsMounted();
  const [openItems, setOpenItems] = useState<string[]>(events.map((e) => e.id));

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
    <div className="space-y-4">
      <div className="flex justify-start gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-sm font-normal"
          onClick={() => handleValueChange(events.map((e) => e.id))}
        >
          全て開く
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-sm font-normal" onClick={() => handleValueChange([])}>
          全て閉じる
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <Accordion.Root type="multiple" value={openItems} onValueChange={handleValueChange} className="w-full">
          {events.map((event) => (
            <Accordion.Item key={event.id} value={event.id}>
              <Accordion.Header className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-base font-semibold hover:bg-gray-100">
                <Accordion.Trigger className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span>{event.name}</span>
                    <Badge variant="status" label={getDisplayStatus(event.status, false)} />
                  </div>
                  <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-300 ease-in-out data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {event.races.map((race) => (
                          <tr key={race.id} className="transition-colors hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                              {race.raceNumber ? `${race.raceNumber}R` : '-'}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/admin/forecasts/${event.id}/races/${race.id}`}
                                  className="text-primary hover:text-primary-hover font-semibold hover:underline"
                                >
                                  {race.name}
                                </Link>
                                <Link
                                  href={`/races/${race.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-400 hover:text-gray-600"
                                  title="投票ページを開く"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{race.venue?.name}</td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{race.distance}m</td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                              {race.surface} {race.condition || ''}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                variant="status"
                                label={getDisplayStatus(
                                  race.status,
                                  race.entries?.some((e) => e.finishPosition !== null) ?? false
                                )}
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
      </div>
    </div>
  );
}
