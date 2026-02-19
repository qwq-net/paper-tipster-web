'use client';

import { AssetChart } from '@/features/stats/components/asset-chart';
import { HistoryList } from '@/features/stats/components/history-list';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible';
import { cn } from '@/shared/utils/cn';
import { ChevronDown } from 'lucide-react';
import { EventStats } from '../actions';

interface EventStatsCardProps {
  event: EventStats;
}

export function EventStatsCard({ event }: EventStatsCardProps) {
  return (
    <Collapsible className="group">
      <Card>
        <div className="flex items-center p-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{event.name}</h3>
              {event.loan > 0 && (
                <span className="bg-destructive/10 text-destructive rounded px-2 py-0.5 text-sm font-medium">
                  借入あり
                </span>
              )}
            </div>
            <div className="flex gap-4 text-sm">
              <div>
                所持金: <span className="font-medium">¥{event.balance.toLocaleString()}</span>
              </div>
              <div className={cn(event.net >= 0 ? 'text-blue-600' : 'text-red-600')}>
                収支:{' '}
                <span className="font-medium">
                  {event.net > 0 && '+'}
                  {event.net.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
              <span className="sr-only">詳細を開く</span>
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="space-y-4 border-t px-4 py-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <span className="text-muted-foreground text-sm">借入総額</span>
                <div className="text-destructive text-lg font-semibold">¥{event.loan.toLocaleString()}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-muted-foreground text-sm font-medium">資産推移</h4>
              <AssetChart data={event.history} title="" />
            </div>

            <div className="space-y-2">
              <h4 className="text-muted-foreground text-sm font-medium">取引履歴</h4>
              <div className="max-h-[300px] overflow-y-auto rounded-md border">
                <HistoryList logs={event.logs} />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
