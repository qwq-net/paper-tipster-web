'use client';

import { RaceDefinition, Venue } from '@/shared/types/race';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { RaceForm } from './race-form';

interface EditRaceDialogProps {
  race: {
    id: string;
    eventId: string;
    date: string;
    location: string;
    name: string;
    raceNumber?: number | null;
    distance: number;
    surface: '芝' | 'ダート';
    condition: '良' | '稍重' | '重' | '不良' | null;
    closingAt?: Date | string | null;
    venueId?: string;
    raceDefinitionId?: string | null;
    direction?: string | null;
  };
  events: Array<{ id: string; name: string; date: string }>;
  raceDefinitions: Array<RaceDefinition>;
  venues: Array<Venue>;
}

export function EditRaceDialog({ race, events, raceDefinitions, venues }: EditRaceDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-500">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>レース情報の編集</DialogTitle>
          <DialogDescription>レース情報を編集します。</DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <RaceForm
            initialData={race}
            events={events}
            raceDefinitions={raceDefinitions}
            venues={venues}
            showClosingAt={true}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
