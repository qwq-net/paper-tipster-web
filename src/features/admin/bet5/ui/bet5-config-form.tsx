'use client';

import { createBet5EventAction } from '@/features/betting/actions/bet5';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/shared/ui';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

type Race = {
  id: string;
  raceNumber: number | null;
  name: string;
};

interface Bet5ConfigFormProps {
  eventId: string;
  races: Race[];
}

export function Bet5ConfigForm({ eventId, races }: Bet5ConfigFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [initialPot, setInitialPot] = useState(0);
  const [selectedRaces, setSelectedRaces] = useState<string[]>([]);

  // Sort races by raceNumber
  const sortedRaces = [...races].sort((a, b) => (a.raceNumber || 0) - (b.raceNumber || 0));

  const handleRaceSelection = (raceId: string) => {
    if (selectedRaces.includes(raceId)) {
      setSelectedRaces(selectedRaces.filter((id) => id !== raceId));
    } else {
      if (selectedRaces.length >= 5) {
        toast.error('これ以上選択できません（5レースまで）');
        return;
      }
      setSelectedRaces([...selectedRaces, raceId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRaces.length !== 5) {
      toast.error('5つのレースを選択してください');
      return;
    }

    startTransition(async () => {
      try {
        await createBet5EventAction({
          eventId,
          raceIds: selectedRaces as [string, string, string, string, string],
          initialPot,
        });
        toast.success('BET5を作成しました');
        router.refresh();
      } catch (error) {
        toast.error('作成に失敗しました');
        console.error(error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>BET5設定</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>対象レース選択 (5レース)</Label>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {sortedRaces.map((race) => (
                <div
                  key={race.id}
                  className={`cursor-pointer rounded-lg border p-3 hover:bg-gray-50 ${
                    selectedRaces.includes(race.id)
                      ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                      : 'border-gray-200'
                  }`}
                  onClick={() => handleRaceSelection(race.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {race.raceNumber ? `${race.raceNumber}R` : 'Ex'} {race.name}
                    </span>
                    {selectedRaces.includes(race.id) && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-xs text-white">
                        {selectedRaces.indexOf(race.id) + 1}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">選択済み: {selectedRaces.length} / 5</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialPot">初期キャリーオーバー金額 (ボーナス)</Label>
            <Input
              id="initialPot"
              type="number"
              min={0}
              value={initialPot}
              onChange={(e) => setInitialPot(Number(e.target.value))}
            />
            <p className="text-sm text-gray-500">ユーザーへの還元額に加算される金額です。</p>
          </div>

          <Button type="submit" disabled={isPending || selectedRaces.length !== 5}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            BET5を作成する
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
