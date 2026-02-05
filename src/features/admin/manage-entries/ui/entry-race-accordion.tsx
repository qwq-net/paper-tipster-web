'use client';

import { useIsMounted } from '@/shared/hooks/use-is-mounted';
import * as Accordion from '@radix-ui/react-accordion';
import { Calendar, ChevronDown, ChevronRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface EntryRaceAccordionProps {
  events: Array<{
    id: string;
    name: string;
    date: string;
    races: Array<{
      id: string;
      name: string;
      raceNumber: number | null;
      location: string | null;
      date: string;
    }>;
  }>;
}

const STORAGE_KEY = 'entry-race-accordion-open-items';

export function EntryRaceAccordion({ events }: EntryRaceAccordionProps) {
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
    return (
      <div className="py-12 text-center text-gray-500">
        登録可能なレースがありません。先にレースを登録してください。
      </div>
    );
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
                <p className="text-sm text-gray-500">{event.date.replace(/-/g, '/')}</p>
              </div>
            </div>
          </Accordion.Trigger>

          <Accordion.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden bg-white">
            <div className="divide-y divide-gray-100 border-t border-gray-100">
              {event.races.length === 0 ? (
                <div className="py-8 text-center text-gray-500">このイベントに登録可能なレースはありません</div>
              ) : (
                event.races.map((race) => (
                  <Link
                    key={race.id}
                    href={`/admin/entries/${race.id}`}
                    className="group flex items-center justify-between p-4 transition-all hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4 pl-8">
                      <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-primary flex items-center gap-2 font-semibold">
                          {race.raceNumber ? (
                            <span className="text-sm font-semibold tracking-tighter text-gray-400 uppercase">
                              {race.raceNumber}R
                            </span>
                          ) : null}
                          {race.name}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {race.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 transition-colors group-hover:text-gray-600" />
                  </Link>
                ))
              )}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
