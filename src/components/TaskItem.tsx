import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Check, Trash2, CalendarPlus, Clock } from 'lucide-react';
import { Task } from '../types/task';
import { formatFriendlyDate, isPastDue, isToday } from '../lib/dateUtils';
import { shareTaskToGoogleCalendar } from '../lib/googleCalendar';

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
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const friendlyDate = formatFriendlyDate(task.dueDate);
  const overdue = task.dueDate ? isPastDue(task.dueDate) && !task.completed : false;
  const today = task.dueDate ? isToday(task.dueDate) : false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 p-3 bg-white dark:bg-paper-darkCard rounded-xl border transition-all ${
        task.completed
          ? 'border-neutral-200/60 dark:border-neutral-800/60 opacity-60'
          : 'border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700'
      }`}
    >
      {/* Touch-Friendly Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        style={{ touchAction: 'none' }}
        className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-grab active:cursor-grabbing focus:outline-none"
        title="Drag to rearrange"
        aria-label="Drag to rearrange"
      >
        <GripVertical size={16} />
      </button>

      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
          task.completed
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-neutral-300 dark:border-neutral-600 hover:border-notion-blue'
        }`}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed && <Check size={14} strokeWidth={3} />}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0 pr-2">
        <p className={`text-sm truncate ${task.completed ? 'line-through text-neutral-400 dark:text-neutral-500' : 'text-ink-primary dark:text-ink-darkPrimary'}`}>
          {task.title}
        </p>

        {/* Date and Time Badges */}
        {(friendlyDate || task.dueTime) && (
          <div className="flex items-center gap-1.5 mt-0.5 text-xs">
            {friendlyDate && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${
                  overdue
                    ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                    : today
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                {friendlyDate}
              </span>
            )}
            {task.dueTime && (
              <span className="inline-flex items-center gap-0.5 text-neutral-500 text-[11px]">
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
          className="p-1.5 text-neutral-400 hover:text-notion-blue hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
          title="Add to Google Calendar"
          aria-label="Add to Google Calendar"
        >
          <CalendarPlus size={16} />
        </button>

        {/* Delete Button */}
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
          title="Delete task"
          aria-label="Delete task"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
