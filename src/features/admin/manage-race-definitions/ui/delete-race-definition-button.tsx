'use client';

import { Button } from '@/shared/ui';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { deleteRaceDefinition } from '../actions';

interface DeleteRaceDefinitionButtonProps {
  id: string;
  name: string;
}

export function DeleteRaceDefinitionButton({ id, name }: DeleteRaceDefinitionButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteRaceDefinition(id);
        toast.success(`「${name}」を削除しました`);
        setOpen(false);
      } catch (error) {
        console.error(error);
        toast.error('削除に失敗しました');
      }
    });
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="animate-in fade-in fixed inset-0 z-50 bg-black/50 duration-200" />
        <AlertDialog.Content className="animate-in zoom-in-95 fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl duration-200">
          <AlertDialog.Title className="text-xl font-semibold text-gray-900">レース定義の削除</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-gray-600">
            「{name}」を削除してもよろしいですか？
            <br />
            この操作は取り消せません。
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <Button variant="secondary">キャンセル</Button>
            </AlertDialog.Cancel>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? '削除中...' : '削除する'}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
