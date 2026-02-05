'use client';

import { Button } from '@/shared/ui';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { VenueForm } from './venue-form';

export function CreateVenueDialog() {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <Button className="bg-[#5865F2] shadow-md transition-all hover:bg-[#4752C4] hover:shadow-lg">
          <Plus className="mr-2 h-4 w-4" />
          会場を追加
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="animate-in fade-in fixed inset-0 z-50 bg-black/50 duration-200" />
        <AlertDialog.Content className="animate-in zoom-in-95 fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl duration-200">
          <div className="mb-4 flex items-center justify-between">
            <AlertDialog.Title className="text-xl font-semibold text-gray-900">会場の新規登録</AlertDialog.Title>
            <AlertDialog.Cancel asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">閉じる</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </AlertDialog.Cancel>
          </div>

          <div className="mt-2">
            <VenueForm onSuccess={() => setOpen(false)} />
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
