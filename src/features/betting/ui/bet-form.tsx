'use client';

import { placeBet } from '@/features/betting/actions';
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import { BET_TYPE_LABELS, BET_TYPES, BetType } from '@/types/betting';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

interface Entry {
  id: string;
  bracketNumber: number | null;
  horseNumber: number | null;
  horseName: string;
}

interface BetFormProps {
  raceId: string;
  walletId: string;
  balance: number;
  entries: Entry[];
}

export function BetForm({ raceId, walletId, balance, entries }: BetFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [betType, setBetType] = useState<BetType>(BET_TYPES.WIN);
  const [selections, setSelections] = useState<number[]>([]);
  const [amount, setAmount] = useState<number>(100);

  // 券種ごとに必要な頭数を定義
  const getRequiredCount = (type: BetType) => {
    switch (type) {
      case BET_TYPES.WIN:
      case BET_TYPES.PLACE:
        return 1;
      case BET_TYPES.QUINELLA:
      case BET_TYPES.EXACTA:
      case BET_TYPES.WIDE:
      case BET_TYPES.BRACKET_QUINELLA:
        return 2;
      case BET_TYPES.TRIFECTA:
      case BET_TYPES.TRIO:
        return 3;
      default:
        return 1;
    }
  };

  const requiredCount = getRequiredCount(betType);

  const handleSelectionChange = (index: number, value: string) => {
    const newSelections = [...selections];
    newSelections[index] = parseInt(value, 10);
    setSelections(newSelections);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selections.length < requiredCount || selections.some((s) => !s)) {
      toast.error('全ての項目を選択してください');
      return;
    }

    if (amount < 100) {
      toast.error('100円以上で入力してください');
      return;
    }

    if (amount > balance) {
      toast.error('残高が不足しています');
      return;
    }

    // 重複チェック（単勝・複勝以外）
    if (betType !== BET_TYPES.WIN && betType !== BET_TYPES.PLACE) {
      const unique = new Set(selections);
      if (unique.size !== selections.length) {
        toast.error('同じ番号を複数選択することはできません');
        return;
      }
    }

    startTransition(async () => {
      try {
        await placeBet({
          raceId,
          walletId,
          details: {
            type: betType,
            selections,
          },
          amount,
        });
        toast.success('馬券を購入しました');
        setSelections([]);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'エラーが発生しました');
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>馬券購入</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>式別（券種）</Label>
            <Select
              value={betType}
              onValueChange={(value: string) => {
                setBetType(value as BetType);
                setSelections([]);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="券種を選択" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BET_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: requiredCount }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Label>{requiredCount > 1 ? `${i + 1}頭目` : '選択'}</Label>
                <Select
                  value={selections[i]?.toString() || ''}
                  onValueChange={(value: string) => handleSelectionChange(i, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選択..." />
                  </SelectTrigger>
                  <SelectContent>
                    {betType === BET_TYPES.BRACKET_QUINELLA
                      ? // 枠連の場合は1-8を表示
                        Array.from({ length: 8 }).map((_, j) => (
                          <SelectItem key={j + 1} value={(j + 1).toString()}>
                            {j + 1}枠
                          </SelectItem>
                        ))
                      : // それ以外は出走馬を表示
                        entries.map((entry) => (
                          <SelectItem key={entry.id} value={entry.horseNumber?.toString() || ''}>
                            {entry.horseNumber}. {entry.horseName}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="amount">購入金額 (円)</Label>
              <span className="text-xs text-gray-400">残高: {balance.toLocaleString()}円</span>
            </div>
            <Input
              id="amount"
              type="number"
              min={100}
              step={100}
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value, 10))}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                購入中...
              </>
            ) : (
              '購入を確定する'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
