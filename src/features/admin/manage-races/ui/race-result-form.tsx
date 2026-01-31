'use client';

import { Badge, Button, Input, Label, Select, SelectItem } from '@/shared/ui';
import { getBracketColor } from '@/shared/utils/bracket';
import { cn } from '@/shared/utils/cn';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { AlertCircle, CheckCircle2, Coins, GripVertical, Info, RotateCcw, Settings2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { finalizeRace } from '../actions';

interface Entry {
  id: string;
  horseNumber: number | null;
  horseName: string;
  bracketNumber: number | null;
}

interface RaceResultFormProps {
  raceId: string;
  entries: Entry[];
  race: {
    status: string;
    surface: string;
    distance: number;
    condition: string | null;
  };
}

const getRankStyles = (position: number) => {
  switch (position) {
    case 1:
      return 'bg-amber-100 text-amber-700 ring-amber-200 border-amber-200';
    case 2:
      return 'bg-slate-100 text-slate-700 ring-slate-200 border-slate-200';
    case 3:
      return 'bg-orange-100 text-orange-700 ring-orange-200 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-400 border-gray-100';
  }
};

function SortableResultItem({ entry, position }: { entry: Entry; position: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entry.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 0,
  };

  const rankStyle = getRankStyles(position);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-2 ring-offset-2 transition-all duration-200',
        isDragging ? 'ring-primary/40 opacity-0 ring-2' : 'hover:border-gray-300'
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-lg font-black italic transition-colors',
          rankStyle
        )}
      >
        {position}
      </div>

      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab p-1 text-gray-300 transition-colors group-hover:text-gray-500"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold ring-1 ring-black/5',
            getBracketColor(entry.bracketNumber)
          )}
        >
          {entry.bracketNumber || '?'}
        </span>
        <span className="text-primary bg-primary/10 ring-primary/10 flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold ring-1">
          {entry.horseNumber || '?'}
        </span>
      </div>

      <div className="flex flex-1 flex-col truncate">
        <span className="truncate text-sm font-bold text-gray-900">{entry.horseName}</span>
      </div>
    </div>
  );
}

export function RaceResultForm({ raceId, entries: initialEntries, race }: RaceResultFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sortedEntries, setSortedEntries] = useState(initialEntries);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // 配当設定
  const [payoutMode, setPayoutMode] = useState<'TOTAL_DISTRIBUTION' | 'MANUAL'>('TOTAL_DISTRIBUTION');
  const [takeoutRate, setTakeoutRate] = useState<number>(25);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const isChanged = JSON.stringify(sortedEntries.map((e) => e.id)) !== JSON.stringify(initialEntries.map((e) => e.id));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setSortedEntries((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleReset = () => {
    setSortedEntries(initialEntries);
    toast.message('初期状態にリセットしました');
  };

  const handleSubmit = () => {
    setShowConfirm(false);
    startTransition(async () => {
      const results = sortedEntries.map((entry, index) => ({
        entryId: entry.id,
        finishPosition: index + 1,
      }));

      try {
        await finalizeRace(raceId, results, {
          payoutMode,
          takeoutRate: takeoutRate / 100, // パーセントを小数に
        });
        toast.success('着順を確定しました（払い戻し計算完了）', {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });
        router.refresh();
      } catch (error) {
        toast.error('エラーが発生しました');
        console.error(error);
      }
    });
  };

  const activeEntry = activeId ? sortedEntries.find((e) => e.id === activeId) : null;
  const activePosition = activeEntry ? sortedEntries.findIndex((e) => e.id === activeEntry.id) + 1 : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* 左カラム: 着順設定 */}
      <div className="space-y-4 lg:col-span-2">
        <div className="flex items-end justify-between px-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-gray-900 italic">着順を確定する</h2>
            <div className="mb-0.5 flex items-center gap-1.5 text-xs font-semibold text-gray-400">
              <Info className="h-4 w-4" />
              ドラッグして着順を並び替えてください
            </div>
          </div>
          {isChanged && (
            <button
              onClick={handleReset}
              className="hover:text-primary mb-0.5 flex items-center gap-1.5 text-xs font-bold text-gray-400 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              リセット
            </button>
          )}
        </div>

        <DndContext
          id={`result-dnd-${raceId}`}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-2">
            <SortableContext items={sortedEntries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
              {sortedEntries.map((entry, index) => (
                <SortableResultItem key={entry.id} entry={entry} position={index + 1} />
              ))}
            </SortableContext>
          </div>

          <DragOverlay adjustScale={false}>
            {activeEntry && (
              <div className="border-primary ring-primary/10 flex scale-105 items-center gap-3 rounded-xl border-2 bg-white p-2 shadow-xl ring-4">
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-lg font-black italic',
                    getRankStyles(activePosition)
                  )}
                >
                  {activePosition}
                </div>
                <GripVertical className="text-primary h-4 w-4" />
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold',
                      getBracketColor(activeEntry.bracketNumber)
                    )}
                  >
                    {activeEntry.bracketNumber || '?'}
                  </span>
                  <span className="text-primary bg-primary/10 ring-primary/10 flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold ring-1">
                    {activeEntry.horseNumber || '?'}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">{activeEntry.horseName}</span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* 右カラム: 設定・アクション */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 space-y-4 text-sm">
            <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
              <Settings2 className="h-4 w-4 text-gray-400" />
              <h4 className="font-bold text-gray-900">レース情報</h4>
            </div>
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <span className="font-medium text-gray-500">ステータス</span>
              <Badge variant="status" label={race.status} />
            </div>
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <span className="font-medium text-gray-500">コース</span>
              <div>
                <Badge variant="surface" label={race.surface} />
                <span className="ml-1 text-xs font-bold text-gray-400">{race.distance}m</span>
              </div>
            </div>
            <div className="flex items-center justify-between pb-2">
              <span className="font-medium text-gray-500">馬場状態</span>
              <Badge variant="condition" label={race.condition} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
              <Coins className="h-4 w-4 text-amber-500" />
              <h4 className="font-bold text-gray-900">配当設定</h4>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-500">配当方式</Label>
                <Select
                  value={payoutMode}
                  onValueChange={(v: string) => setPayoutMode(v as 'TOTAL_DISTRIBUTION' | 'MANUAL')}
                >
                  <SelectItem value="TOTAL_DISTRIBUTION">全額配分 (控除率0%)</SelectItem>
                  <SelectItem value="MANUAL">パリミュチュエル (控除率指定)</SelectItem>
                </Select>
              </div>

              {payoutMode === 'MANUAL' && (
                <div className="animate-in slide-in-from-right-2 fade-in space-y-1.5">
                  <Label className="text-xs font-bold text-gray-500">控除率 (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={takeoutRate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setTakeoutRate(parseInt(e.target.value) || 0)
                      }
                      className="h-9 font-bold"
                    />
                    <span className="text-sm font-bold text-gray-400">%</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 rounded-xl bg-blue-50/50 p-3 ring-1 ring-blue-100/50">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                <p className="text-[10px] leading-relaxed text-blue-600/80">
                  {payoutMode === 'TOTAL_DISTRIBUTION'
                    ? '全ての賭け金を的中者で山分けします。もっともシンプルで身内遊びに適した設定です。'
                    : '設定した控除率を差し引いた金額を的中者で分配します。'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <AlertDialog.Root open={showConfirm} onOpenChange={setShowConfirm}>
              <AlertDialog.Trigger asChild>
                <Button
                  className={cn(
                    'shadow-primary/20 relative w-full py-6 text-lg font-black shadow-lg transition-all duration-300 active:scale-[0.98]',
                    isChanged ? 'from-primary to-primary/80 bg-linear-to-br' : 'grayscale-50'
                  )}
                  disabled={isPending}
                >
                  {isPending ? '確定処理中...' : '着順を確定する'}
                  {isChanged && !isPending && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 animate-ping rounded-full bg-white/40" />
                  )}
                </Button>
              </AlertDialog.Trigger>
              <AlertDialog.Portal>
                <AlertDialog.Overlay className="animate-in fade-in fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all duration-300" />
                <AlertDialog.Content className="animate-in zoom-in-95 fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                      <AlertCircle className="h-8 w-8" />
                    </div>
                    <AlertDialog.Title className="mb-2 text-xl font-bold text-gray-900 italic">
                      着順を確定しますか？
                    </AlertDialog.Title>
                    <AlertDialog.Description className="text-sm text-gray-500">
                      この操作を行うと、投票された馬券の払い戻し計算が
                      <span className="mx-1 font-bold text-gray-900 underline">
                        {payoutMode === 'TOTAL_DISTRIBUTION' ? '全額配分' : `控除率 ${takeoutRate}%`}
                      </span>
                      で実行されます。
                      <br />
                      <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 font-bold text-gray-900">
                        <div className="flex justify-between border-b border-gray-100 pb-1 italic">
                          <span className="text-amber-600">1着</span>
                          <span>{sortedEntries[0]?.horseName}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 py-1 italic">
                          <span className="text-slate-500">2着</span>
                          <span>{sortedEntries[1]?.horseName}</span>
                        </div>
                        <div className="flex justify-between pt-1 italic">
                          <span className="text-orange-600">3着</span>
                          <span>{sortedEntries[2]?.horseName}</span>
                        </div>
                      </div>
                    </AlertDialog.Description>
                  </div>
                  <div className="mt-8 flex flex-col gap-3">
                    <AlertDialog.Action asChild>
                      <Button onClick={handleSubmit} className="w-full py-5 text-lg font-bold">
                        確定する
                      </Button>
                    </AlertDialog.Action>
                    <AlertDialog.Cancel asChild>
                      <Button variant="outline" className="w-full py-5 text-lg font-bold">
                        キャンセル
                      </Button>
                    </AlertDialog.Cancel>
                  </div>
                </AlertDialog.Content>
              </AlertDialog.Portal>
            </AlertDialog.Root>
          </div>
        </div>
      </div>
    </div>
  );
}
