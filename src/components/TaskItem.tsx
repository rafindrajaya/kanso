import React, { useState, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Check,
  Trash2,
  CalendarPlus,
  Clock,
  ChevronDown,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { Task } from '../types/task';
import { formatFriendlyDate, isPastDue, isToday } from '../lib/dateUtils';
import { shareTaskToGoogleCalendar } from '../lib/googleCalendar';
import { triggerHaptic } from '../lib/haptics';
import { playQuestCompleteSound } from '../lib/audio';
import { TaskNotesEditor } from './TaskNotesEditor';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Task>) => void;
}

export const TaskItemComponent: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onUpdate,
}): React.JSX.Element => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

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

  const handleCheckboxClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (!task.completed) {
      playQuestCompleteSound();
      triggerHaptic('success');
    } else {
      triggerHaptic('light');
    }
    onToggle(task.id);
  };

  const handleNotesSave = (notes: string): void => {
    onUpdate?.(task.id, { notes: notes.trim() || undefined });
  };

  const handleExpandToggle = (): void => {
    setIsExpanded(prev => !prev);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex flex-col p-2.5 sm:p-3.5 bg-comic-card dark:bg-comic-cardDark rounded-2xl border-2 border-comic-ink dark:border-white transition-all ${
        task.completed
          ? 'opacity-65 shadow-none bg-comic-bg/60 dark:bg-neutral-900/60'
          : 'comic-shadow hover:comic-shadow-lg hover:-translate-y-0.5'
      }`}
    >
      {/* Top Row: Touch targets conform to 44px minimum for mobile */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Touch-Friendly Drag Handle (44px target) */}
        <button
          {...attributes}
          {...listeners}
          style={{ touchAction: 'none' }}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-comic-ink dark:text-neutral-200 hover:text-comic-green cursor-grab active:cursor-grabbing focus:outline-none shrink-0"
          title="Drag to rearrange"
          aria-label="Drag to rearrange"
        >
          <GripVertical size={16} />
        </button>

        {/* Checkbox with minimum 44px hit container */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 focus:outline-none"
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          <span
            className={`w-5 h-5 rounded-md flex items-center justify-center border-2 border-comic-ink dark:border-white transition-all ${
              task.completed
                ? 'bg-comic-green dark:bg-emerald-500 border-comic-green dark:border-emerald-400 text-white'
                : 'hover:bg-comic-greenLight dark:hover:bg-neutral-800'
            }`}
          >
            {task.completed && <Check size={14} strokeWidth={3.5} />}
          </span>
        </button>

        {/* Task Title & Badges: Tap anywhere to expand / collapse */}
        <div
          onClick={handleExpandToggle}
          className="flex-1 min-w-0 pr-1 py-1 cursor-pointer select-none"
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleExpandToggle();
            }
          }}
          aria-expanded={isExpanded}
        >
          <p
            className={`text-sm font-bold ${
              isExpanded ? 'break-words' : 'truncate'
            } ${
              task.completed
                ? 'line-through text-comic-inkMuted dark:text-neutral-400'
                : 'text-[#0F0F0F] dark:text-white'
            }`}
          >
            {task.title}
          </p>

          {/* Date, Time, and Notes Badges */}
          <div className="flex items-center flex-wrap gap-1.5 mt-0.5 text-xs font-mono">
            {friendlyDate && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded border text-[10px] font-bold ${
                  overdue
                    ? 'bg-red-100 text-red-900 border-red-900 dark:bg-red-950 dark:text-red-200 dark:border-red-500'
                    : today
                    ? 'bg-amber-100 text-amber-950 border-amber-950 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-400'
                    : 'bg-comic-bg text-comic-ink border-comic-ink dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-500'
                }`}
              >
                {friendlyDate}
              </span>
            )}
            {task.dueTime && (
              <span className="inline-flex items-center gap-0.5 text-comic-inkMuted dark:text-neutral-400 text-[10px]">
                <Clock size={10} />
                {task.dueTime}
              </span>
            )}
            {task.notes && !isExpanded && (
              <span
                className="inline-flex items-center gap-0.5 text-comic-inkMuted dark:text-neutral-400 text-[10px] font-bold bg-comic-bg dark:bg-neutral-800 px-1.5 py-0.2 rounded border border-comic-ink/30 dark:border-neutral-600"
                title="Has description details"
              >
                <FileText size={10} />
                Notes
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: 44px touch targets on mobile */}
        <div className="flex items-center shrink-0">
          {/* Expand/Collapse Chevron Button */}
          <button
            type="button"
            onClick={handleExpandToggle}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-comic-ink dark:text-neutral-200 hover:text-comic-green rounded-lg transition-colors"
            title={isExpanded ? 'Collapse details' : 'Expand details'}
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>

          {/* Google Calendar Sync Button */}
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              shareTaskToGoogleCalendar(task);
            }}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-comic-ink dark:text-neutral-200 hover:text-comic-green rounded-lg transition-colors"
            title="Add to Google Calendar"
            aria-label="Add to Google Calendar"
          >
            <CalendarPlus size={18} />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-comic-inkMuted dark:text-neutral-400 hover:text-red-600 rounded-lg transition-colors"
            title="Delete task"
            aria-label="Delete task"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Notion-Style Description Section (Expanded View) */}
      {isExpanded && (
        <TaskNotesEditor
          taskId={task.id}
          initialNotes={task.notes}
          onSave={handleNotesSave}
        />
      )}
    </div>
  );
};

export const TaskItem = memo(TaskItemComponent);
