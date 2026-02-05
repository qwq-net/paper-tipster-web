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
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { RaceDefinitionForm } from './race-definition-form';

interface EditRaceDefinitionDialogProps {
  raceDefinition: {
    id: string;
    name: string;
    code?: string | null;
    grade: string;
    type: string;
    defaultDirection: string;
    defaultDistance: number;
    defaultVenueId: string;
    defaultSurface: string;
  };
  venues: Array<{ id: string; name: string; defaultDirection?: string }>;
}

export function EditRaceDefinitionDialog({ raceDefinition, venues }: EditRaceDefinitionDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-500">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>レース定義の編集</DialogTitle>
          <DialogDescription>レース定義（マスタ）の内容を編集します。</DialogDescription>
        </DialogHeader>
        <RaceDefinitionForm initialData={raceDefinition} venues={venues} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
