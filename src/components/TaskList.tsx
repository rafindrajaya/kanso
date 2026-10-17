import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task } from '../types/task';
import { TaskItem } from './TaskItem';
import { CheckCircle2, Archive } from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onUpdate?: (id: string, updates: Partial<Task>) => void;
  isCompletedView?: boolean;
  onArchiveAll?: () => void;
  archivedLifetimeCount?: number;
}

interface ArchiveControlsProps {
  onArchiveAll?: () => void;
  archivedLifetimeCount: number;
  hasTasks: boolean;
}

const ArchiveControls: React.FC<ArchiveControlsProps> = ({
  onArchiveAll,
  archivedLifetimeCount,
  hasTasks,
}) => {
  const handleArchiveClick = (): void => {
    if (!onArchiveAll) return;
    if (window.confirm('Archive all completed quests? They will be permanently credited into your Frog Wizard EXP.')) {
      triggerHaptic('success');
      onArchiveAll();
    }
  };

  return (
    <div className="mb-3 p-3 bg-comic-card dark:bg-comic-cardDark border-2 border-comic-ink dark:border-white rounded-2xl comic-shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
      <div className="flex items-center gap-2 text-comic-inkMuted dark:text-neutral-300">
        <Archive size={14} className="text-comic-green dark:text-emerald-400 shrink-0" />
        <span>
          Auto-archives quests after 30 days
          {archivedLifetimeCount > 0 && (
            <strong className="text-comic-ink dark:text-white"> ({archivedLifetimeCount} in EXP)</strong>
          )}
        </span>
      </div>
      {hasTasks && onArchiveAll && (
        <button
          type="button"
          onClick={handleArchiveClick}
          className="self-end sm:self-auto px-2.5 py-1 rounded-xl border border-comic-ink dark:border-white text-comic-ink dark:text-white hover:bg-comic-bg dark:hover:bg-neutral-800 font-bold font-mono text-[11px] transition-colors"
        >
          Archive All Done Now
        </button>
      )}
    </div>
  );
};

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggle,
  onDelete,
  onReorder,
  onUpdate,
  isCompletedView,
  onArchiveAll,
  archivedLifetimeCount = 0,
}): React.JSX.Element => {
  // Mobile touch sensor with 150ms delay to allow natural scrolling on iPhone 12 mini
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      triggerHaptic('medium');
      onReorder(String(active.id), String(over.id));
    }
  };

  if (tasks.length === 0) {
    return (
      <div>
        {isCompletedView && (
          <ArchiveControls
            onArchiveAll={onArchiveAll}
            archivedLifetimeCount={archivedLifetimeCount}
            hasTasks={false}
          />
        )}
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-comic-ink/30 dark:border-neutral-500 bg-comic-card dark:bg-comic-cardDark comic-shadow">
          <CheckCircle2 size={36} className="mx-auto text-comic-inkMuted dark:text-neutral-400 mb-2" />
          <p className="text-sm font-bold text-comic-ink dark:text-neutral-200">
            {isCompletedView ? 'No completed quests in the last 30 days' : 'No quests active'}
          </p>
          <p className="text-xs font-mono text-comic-inkMuted dark:text-neutral-400 mt-0.5">
            {isCompletedView
              ? archivedLifetimeCount > 0
                ? `${archivedLifetimeCount} quests are safely preserved in your Wizard’s lifetime EXP ✦`
                : 'Complete quests to level up your Frog Wizard ✦'
              : 'Rest at the campfire or add a new quest above ✦'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {isCompletedView && (
        <ArchiveControls
          onArchiveAll={onArchiveAll}
          archivedLifetimeCount={archivedLifetimeCount}
          hasTasks={true}
        />
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
