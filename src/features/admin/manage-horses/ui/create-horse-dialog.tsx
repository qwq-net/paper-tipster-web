'use client';

import { HorseTagType } from '@/shared/constants/horse-tags';
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
import { HorseForm } from './horse-form';

export function CreateHorseDialog({
  tagOptions,
}: {
  tagOptions: Array<{ id: string; type: HorseTagType; content: string }>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 font-semibold shadow-sm transition-all hover:shadow-md active:scale-95">
          <Plus className="h-4 w-4" />
          新規馬登録
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新規馬登録</DialogTitle>
          <DialogDescription>新しい競走馬の情報を入力してください。</DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <HorseForm tagOptions={tagOptions} onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
