'use client';

import { calculateBet5PayoutAction, closeBet5EventAction } from '@/features/betting/actions/bet5';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import { Calculator, Loader2, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

interface Bet5Event {
  id: string;
  eventId: string;
  status: 'SCHEDULED' | 'CLOSED' | 'FINALIZED' | 'CANCELLED';
  initialPot: number;
}

interface Bet5ManageCardProps {
  bet5Event: Bet5Event;
  eventId: string;
}

export function Bet5ManageCard({ bet5Event, eventId }: Bet5ManageCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    if (!confirm('本当に締め切りますか？ユーザーはこれ以降投票できなくなります。')) return;

    startTransition(async () => {
      try {
        await closeBet5EventAction(bet5Event.id, eventId);
        toast.success('締め切りました');
        router.refresh();
      } catch (error) {
        toast.error('締め切りに失敗しました');
        console.error(error);
      }
    });
  };

  const handleCalculate = () => {
    if (!confirm('全レース確定後に実行してください。配当計算と払い戻しを実行しますか？')) return;

    startTransition(async () => {
      try {
        const result = await calculateBet5PayoutAction(bet5Event.id, eventId);
        if (result.success) {
          toast.success(`集計完了: 的中${result.winCount}口, 配当${result.dividend}円`);
        } else {
          toast.error(`失敗: ${result.message}`);
        }
        router.refresh();
      } catch (error) {
        toast.error('計算処理に失敗しました');
        console.error(error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>BET5管理</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
          <div>
            <p className="font-medium text-gray-900">ステータス</p>
            <p className="text-sm text-gray-500">{bet5Event.status}</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">初期Pot</p>
            <p className="text-sm text-gray-500">{bet5Event.initialPot.toLocaleString()}円</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {bet5Event.status === 'SCHEDULED' && (
            <Button variant="destructive" onClick={handleClose} disabled={isPending}>
              <Lock className="mr-2 h-4 w-4" />
              締め切り (受付終了)
            </Button>
          )}

          {/* Show Calculate button if CLOSED (ready for result) or even SCHEDULED if manual close skipped?
              Ideally should be closed first. But for flexibility let's allow if not finalized.
              Actually logic checks status.
          */}
          {bet5Event.status !== 'FINALIZED' && (
            <Button variant="secondary" onClick={handleCalculate} disabled={isPending}>
              <Calculator className="mr-2 h-4 w-4" />
              配当計算・払い戻し実行
            </Button>
          )}

          {bet5Event.status === 'FINALIZED' && (
            <div className="flex items-center font-medium text-green-600">
              <Calculator className="mr-2 h-4 w-4" />
              集計・払い戻し完了済み
            </div>
          )}
        </div>
        {isPending && (
          <div className="flex items-center text-sm text-gray-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            処理中...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
