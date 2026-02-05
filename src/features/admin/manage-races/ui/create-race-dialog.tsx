'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { RaceForm } from './race-form';

interface CreateRaceDialogProps {
  events: Array<{ id: string; name: string; date: string }>;
  raceDefinitions: Array<{
    id: string;
    name: string;
    grade: string;
    defaultDistance: number;
    defaultSurface: string;
    defaultVenueId: string;
    defaultDirection: string;
  }>;
  venues: Array<{ id: string; name: string; defaultDirection: string }>;
}

export function CreateRaceDialog({ events, raceDefinitions, venues }: CreateRaceDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 font-semibold shadow-sm transition-all hover:shadow-md active:scale-95">
          <Plus className="h-4 w-4" />
          新規レース追加
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新規レース登録</DialogTitle>
          <DialogDescription>新しいレースの基本情報を入力してください。</DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <RaceForm
            events={events}
            raceDefinitions={raceDefinitions}
            venues={venues}
            showClosingAt={false}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
