'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteHorse } from '../actions';

interface DeleteHorseButtonProps {
  horseId: string;
  horseName: string;
}

export function DeleteHorseButton({ horseId, horseName }: DeleteHorseButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteHorse(horseId);
      toast.success(`${horseName}が削除されました`);
    } catch (error) {
      toast.error('削除に失敗しました');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button
          className="text-gray-400 transition-colors hover:text-red-600 disabled:opacity-50"
          title="削除"
          disabled={isDeleting}
        >
          <Trash2 size={18} />
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="animate-in fade-in fixed inset-0 z-50 bg-black/50 duration-200" />
        <AlertDialog.Content className="animate-in zoom-in-95 fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl duration-200">
          <AlertDialog.Title className="text-xl font-bold text-gray-900">馬の削除</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-gray-600">
            本当に「{horseName}」を削除してもよろしいですか？この操作は取り消せません。
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <button className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-hidden">
                キャンセル
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={handleDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition-all hover:bg-red-700 hover:shadow-md focus:outline-hidden active:scale-95"
              >
                削除する
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
