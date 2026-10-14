import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Check, Trash2, CalendarPlus, Clock } from 'lucide-react';
import { Task } from '../types/task';
import { formatFriendlyDate, isPastDue, isToday } from '../lib/dateUtils';
import { shareTaskToGoogleCalendar } from '../lib/googleCalendar';
import { triggerHaptic } from '../lib/haptics';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const friendlyDate = formatFriendlyDate(task.dueDate);
  const overdue = task.dueDate ? isPastDue(task.dueDate) && !task.completed : false;
  const today = task.dueDate ? isToday(task.dueDate) : false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2.5 p-3.5 bg-comic-card dark:bg-comic-cardDark rounded-2xl border-2 border-comic-ink dark:border-neutral-200 transition-all ${
        task.completed
          ? 'opacity-50 line-through shadow-none'
          : 'shadow-comic hover:shadow-comic-lg hover:-translate-y-0.5'
      }`}
    >
      {/* Touch-Friendly Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        style={{ touchAction: 'none' }}
        className="p-1 text-comic-ink dark:text-neutral-300 hover:text-comic-green cursor-grab active:cursor-grabbing focus:outline-none"
        title="Drag to rearrange"
        aria-label="Drag to rearrange"
      >
        <GripVertical size={16} />
      </button>

      {/* Checkbox with Solid Ink Border */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic(task.completed ? 'light' : 'success');
          onToggle(task.id);
        }}
        className={`w-5 h-5 rounded-md flex items-center justify-center border-2 border-comic-ink dark:border-neutral-200 transition-all ${
          task.completed
            ? 'bg-comic-green text-white'
            : 'hover:bg-comic-greenLight dark:hover:bg-neutral-800'
        }`}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed && <Check size={14} strokeWidth={3.5} />}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0 pr-1">
        <p className={`text-sm font-semibold truncate ${task.completed ? 'text-comic-inkMuted dark:text-neutral-500' : 'text-comic-ink dark:text-neutral-100'}`}>
          {task.title}
        </p>

        {/* Date and Time Badges */}
        {(friendlyDate || task.dueTime) && (
          <div className="flex items-center gap-1.5 mt-0.5 text-xs font-mono">
            {friendlyDate && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded border text-[10px] font-bold ${
                  overdue
                    ? 'bg-red-100 text-red-800 border-red-800 dark:bg-red-950 dark:text-red-200'
                    : today
                    ? 'bg-amber-100 text-amber-900 border-amber-900 dark:bg-amber-950 dark:text-amber-200'
                    : 'bg-comic-bg text-comic-ink border-comic-ink dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700'
                }`}
              >
                {friendlyDate}
              </span>
            )}
            {task.dueTime && (
              <span className="inline-flex items-center gap-0.5 text-comic-inkMuted text-[10px]">
                <Clock size={10} />
                {task.dueTime}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        {/* Google Calendar Sync Button */}
        <button
          type="button"
          onClick={() => shareTaskToGoogleCalendar(task)}
          className="p-1.5 text-comic-ink dark:text-neutral-300 hover:text-comic-green hover:bg-comic-greenLight dark:hover:bg-neutral-800 rounded-lg border border-transparent hover:border-comic-ink transition-colors"
          title="Add to Google Calendar"
          aria-label="Add to Google Calendar"
        >
          <CalendarPlus size={16} />
        </button>

        {/* Delete Button */}
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="p-1.5 text-comic-inkMuted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg border border-transparent hover:border-red-600 transition-colors"
          title="Delete task"
          aria-label="Delete task"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
