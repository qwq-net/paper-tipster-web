'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface Race {
  id: string;
  name: string;
  raceNumber: number | null;
  location: string;
  distance: number;
  surface: string;
  date: string;
  entries: unknown[];
}

interface Event {
  id: string;
  name: string;
  date: string;
  races: Race[];
}

interface EventAccordionProps {
  events: Event[];
}

export function EventAccordion({ events }: EventAccordionProps) {
  return (
    <Accordion.Root type="multiple" className="w-full">
      {events.map((event) => (
        <Accordion.Item key={event.id} value={event.id} className="border-b border-gray-200 last:border-b-0">
          <Accordion.Trigger className="group flex w-full items-center justify-between bg-gray-50 px-6 py-4 text-left transition-colors hover:bg-gray-100">
            <div className="flex flex-1 items-center gap-8">
              <div className="min-w-[300px]">
                <span className="text-sm font-semibold text-gray-900">{event.name}</span>
              </div>
              <div className="min-w-[120px]">
                <span className="text-sm text-gray-500">{event.date}</span>
              </div>
              <div className="min-w-[100px]">
                <span className="text-sm text-gray-500">{event.races.length}レース</span>
              </div>
            </div>
            <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </Accordion.Trigger>
          <Accordion.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden bg-white">
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
                      <div className="flex min-w-[360px] items-center gap-3">
                        <span className="flex h-6 w-8 shrink-0 items-center justify-center rounded bg-gray-100 text-sm font-semibold text-gray-600">
                          {race.raceNumber}R
                        </span>
                        <span className="text-sm font-semibold text-gray-900">{race.name}</span>
                      </div>
                      <div className="min-w-[120px]">
                        <span className="text-sm text-gray-600">{race.location}</span>
                      </div>
                      <div className="min-w-[120px]">
                        <span className="text-sm text-gray-500">
                          {race.surface} {race.distance}m
                        </span>
                      </div>
                      <div className="min-w-[80px]">
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-medium text-blue-700">
                          {race.entries.length}頭
                        </span>
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
  );
}
