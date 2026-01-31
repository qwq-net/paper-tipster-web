'use client';

import { Button } from '@/shared/ui';
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
import { AlertCircle, CheckCircle2, GripVertical, Info, RotateCcw } from 'lucide-react';
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

export function RaceResultForm({ raceId, entries: initialEntries }: RaceResultFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sortedEntries, setSortedEntries] = useState(initialEntries);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

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
        await finalizeRace(raceId, results);
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
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
            <Info className="h-3.5 w-3.5" />
            ドラッグして着順を並び替えてください
          </div>
          {isChanged && (
            <button
              onClick={handleReset}
              className="hover:text-primary flex items-center gap-1.5 text-xs font-semibold text-gray-400 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              リセット
            </button>
          )}
        </div>
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
            <div className="border-primary ring-primary/10 flex scale-105 items-center gap-3 rounded-xl border-2 bg-white p-2 ring-4">
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

      <div className="flex flex-col gap-3 pt-2">
        <AlertDialog.Root open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialog.Trigger asChild>
            <Button
              className={cn(
                'relative w-full overflow-hidden py-6 text-xl font-black transition-all duration-300 active:scale-[0.98]',
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
            <AlertDialog.Content className="animate-in zoom-in-95 fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <AlertDialog.Title className="mb-2 text-xl font-bold text-gray-900 italic">
                  着順を確定しますか？
                </AlertDialog.Title>
                <AlertDialog.Description className="text-sm text-gray-500">
                  この操作を行うと、投票された馬券の払い戻し計算が実行されます。
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
  );
}
