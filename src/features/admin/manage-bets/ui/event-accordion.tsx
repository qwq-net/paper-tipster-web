'use client';

import { useIsMounted } from '@/shared/hooks/use-is-mounted';
import { Badge, Button } from '@/shared/ui';
import { getDisplayStatus } from '@/shared/utils/race-status';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Race {
  id: string;
  name: string;
  raceNumber: number | null;
  distance: number;
  surface: string;
  condition: string | null;
  date: string;
  entries: unknown[];
  venue: {
    shortName: string;
    name: string;
  };
}

interface Event {
  id: string;
  name: string;
  date: string;
  status: string;
  races: Race[];
}

interface EventAccordionProps {
  events: Event[];
}

const STORAGE_KEY = 'event-accordion-open-items_v2';

export function EventAccordion({ events }: EventAccordionProps) {
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
    return (
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="py-12 text-center text-gray-500">登録されているイベントはありません</div>
      </div>
    );
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
                  <div className="flex w-full items-center justify-start gap-4">
                    <span>{event.name}</span>
                    <Badge variant="status" label={getDisplayStatus(event.status, false)} />
                    <span className="text-sm font-normal text-gray-500">{event.races.length}レース</span>
                  </div>
                  <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
                <div className="border-t border-gray-100">
                  {event.races.length === 0 ? (
                    <div className="px-6 py-8 text-center text-sm text-gray-400">
                      このイベントにはレースが登録されていません
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {event.races.map((race) => (
                        <Link
                          key={race.id}
                          href={`/admin/bets/${race.id}`}
                          className="flex items-center gap-8 px-6 py-3 pl-12 transition-colors hover:bg-gray-50"
                        >
                          <div className="flex w-[240px] shrink-0 items-center gap-3">
                            <span className="flex h-6 w-8 shrink-0 items-center justify-center rounded bg-gray-100 text-sm font-semibold text-gray-600">
                              {race.raceNumber}R
                            </span>
                            <span className="truncate text-sm font-semibold text-blue-600 hover:underline">
                              {race.name}
                            </span>
                          </div>
                          <div className="w-[120px] shrink-0">
                            <span className="text-sm text-gray-600">{race.venue?.name}</span>
                          </div>
                          <div className="w-[80px] shrink-0">
                            <span className="text-sm text-gray-500">{race.distance}m</span>
                          </div>
                          <div className="w-[100px] shrink-0">
                            <span className="text-sm text-gray-500">
                              {race.surface} {race.condition || ''}
                            </span>
                          </div>
                          <div className="min-w-[80px]">
                            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-medium text-blue-700">
                              {race.entries.length}頭
                            </span>
                          </div>
                          <div className="ml-auto">
                            <ChevronDown className="h-4 w-4 -rotate-90 text-gray-300" />
                          </div>
                        </Link>
                      ))}
                    </div>
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
