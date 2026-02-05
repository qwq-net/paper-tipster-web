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
import { RaceDefinitionForm } from './race-definition-form';

interface CreateRaceDefinitionDialogProps {
  venues: Array<{ id: string; name: string; defaultDirection?: string }>;
}

export function CreateRaceDefinitionDialog({ venues }: CreateRaceDefinitionDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="from-primary to-primary/80 hover:to-primary bg-linear-to-r shadow-md transition-all hover:shadow-lg">
          <Plus className="mr-2 -ml-1 h-4 w-4" />
          新規登録
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>レース定義の登録</DialogTitle>
          <DialogDescription>新しいレース定義（マスタ）を作成します。</DialogDescription>
        </DialogHeader>
        <RaceDefinitionForm venues={venues} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
