'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { RaceForm } from './race-form';

interface EditRaceDialogProps {
  race: {
    id: string;
    date: string;
    location: string;
    name: string;
    distance: number;
    surface: '芝' | 'ダート';
    condition: '良' | '稍重' | '重' | '不良' | null;
  };
}

export function EditRaceDialog({ race }: EditRaceDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <button className="mr-2 text-gray-400 transition-colors hover:text-blue-600" title="編集">
          <Pencil size={18} />
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="animate-in fade-in fixed inset-0 z-50 bg-black/50 duration-200" />
        <AlertDialog.Content className="animate-in zoom-in-95 fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl duration-200">
          <div className="mb-4 flex items-center justify-between">
            <AlertDialog.Title className="text-xl font-bold text-gray-900">レース情報の編集</AlertDialog.Title>
            <AlertDialog.Cancel asChild>
              <button className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">閉じる</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </AlertDialog.Cancel>
          </div>

          <div className="mt-2">
            <RaceForm initialData={race} onSuccess={() => setOpen(false)} />
          </div>

          <div className="mt-4 flex justify-end">
            <AlertDialog.Cancel asChild>
              <button className="text-sm font-medium text-gray-500 hover:text-gray-700">キャンセル</button>
            </AlertDialog.Cancel>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
