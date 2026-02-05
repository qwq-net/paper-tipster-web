'use client';

import { Button } from '@/shared/ui';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteVenue } from '../actions';

interface DeleteVenueButtonProps {
  venueId: string;
  venueName: string;
}

export function DeleteVenueButton({ venueId, venueName }: DeleteVenueButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteVenue(venueId);
      toast.success(`${venueName}を削除しました`);
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
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-red-600 disabled:opacity-50"
          title="削除"
          disabled={isDeleting}
        >
          <Trash2 size={18} />
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="animate-in fade-in fixed inset-0 z-50 bg-black/50 duration-200" />
        <AlertDialog.Content className="animate-in zoom-in-95 fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl duration-200">
          <AlertDialog.Title className="text-xl font-semibold text-gray-900">会場の削除</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-gray-600">
            本当に「{venueName}」を削除してもよろしいですか？この操作は取り消せません。
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <Button variant="secondary">キャンセル</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button variant="destructive" onClick={handleDelete}>
                削除する
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
