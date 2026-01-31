'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getWalletTransactions } from '../queries';
import { Transaction, TransactionList } from './transaction-list';

interface TransactionHistoryDialogProps {
  walletId: string;
  eventName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionHistoryDialog({ walletId, eventName, open, onOpenChange }: TransactionHistoryDialogProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open && !prevOpen) {
    setPrevOpen(true);
    setIsLoading(true);
    setTransactions([]);
  } else if (!open && prevOpen) {
    setPrevOpen(false);
  }

  useEffect(() => {
    let active = true;
    if (open) {
      getWalletTransactions(walletId)
        .then((data) => {
          if (active) {
            const mapped = data.map((tx) => ({
              ...tx,
              description: null,
            }));
            setTransactions(mapped);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error(err);
          if (active) setIsLoading(false);
        });
    }
    return () => {
      active = false;
    };
  }, [open, walletId]);

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="animate-in fade-in fixed inset-0 z-50 bg-black/50 duration-200" />
        <AlertDialog.Content className="animate-in zoom-in-95 fixed top-1/2 left-1/2 z-50 flex max-h-[80vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-gray-50 p-0 shadow-xl duration-200">
          <div className="flex items-center justify-between rounded-t-lg border-b bg-white p-4">
            <div>
              <AlertDialog.Title className="text-lg font-bold text-gray-900">取引履歴</AlertDialog.Title>
              <AlertDialog.Description className="text-xs text-gray-500">{eventName}</AlertDialog.Description>
            </div>
            <AlertDialog.Cancel asChild>
              <button className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </AlertDialog.Cancel>
          </div>

          <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
              </div>
            ) : (
              <TransactionList transactions={transactions} />
            )}
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
