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
import { CheckCircle2 } from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggle,
  onDelete,
  onReorder,
}) => {
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      triggerHaptic('medium');
      onReorder(String(active.id), String(over.id));
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-comic-ink/30 dark:border-neutral-500 bg-comic-card dark:bg-comic-cardDark comic-shadow">
        <CheckCircle2 size={36} className="mx-auto text-comic-inkMuted dark:text-neutral-400 mb-2" />
        <p className="text-sm font-bold text-comic-ink dark:text-neutral-200">
          No quests active
        </p>
        <p className="text-xs font-mono text-comic-inkMuted dark:text-neutral-400 mt-0.5">
          Rest at the campfire or add a new quest above ✦
        </p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
