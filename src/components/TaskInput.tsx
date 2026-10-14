import React, { useState } from 'react';
import { Plus, Calendar, Clock } from 'lucide-react';
import { NewTaskInput } from '../types/task';
import { getTodayString, getTomorrowString } from '../lib/dateUtils';

interface TaskInputProps {
  onAdd: (input: NewTaskInput) => void;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<string>(getTodayString());
  const [dueTime, setDueTime] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
    });

    setTitle('');
    setIsExpanded(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-comic-card dark:bg-comic-cardDark rounded-2xl border-2 border-comic-ink dark:border-neutral-200 p-3.5 shadow-comic transition-all focus-within:shadow-comic-lg">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-comic-ink dark:text-neutral-300 p-1 rounded-lg border-2 border-comic-ink dark:border-neutral-200 hover:bg-comic-bg dark:hover:bg-neutral-800 transition-colors"
          title="Toggle options"
        >
          <Plus size={16} className={isExpanded ? 'rotate-45 transition-transform' : 'transition-transform'} />
        </button>

        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="New quest or task... (Press Enter)"
          className="flex-1 bg-transparent text-sm md:text-base font-medium outline-none text-comic-ink dark:text-neutral-100 placeholder:text-comic-inkMuted/60"
        />

        <button
          type="submit"
          disabled={!title.trim()}
          className="px-4 py-1.5 bg-comic-ink text-white dark:bg-neutral-100 dark:text-comic-ink rounded-full text-xs font-black tracking-wide border-2 border-comic-ink dark:border-neutral-200 shadow-comic-sm hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          + Add
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t-2 border-comic-ink/10 dark:border-neutral-800 flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => setDueDate(getTodayString())}
            className={`px-2.5 py-1 rounded-lg border-2 transition-all ${
              dueDate === getTodayString()
                ? 'bg-comic-green text-white border-comic-green shadow-comic-sm'
                : 'border-comic-ink dark:border-neutral-700 text-comic-ink dark:text-neutral-300 bg-comic-bg dark:bg-neutral-800'
            }`}
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => setDueDate(getTomorrowString())}
            className={`px-2.5 py-1 rounded-lg border-2 transition-all ${
              dueDate === getTomorrowString()
                ? 'bg-comic-green text-white border-comic-green shadow-comic-sm'
                : 'border-comic-ink dark:border-neutral-700 text-comic-ink dark:text-neutral-300 bg-comic-bg dark:bg-neutral-800'
            }`}
          >
            Tomorrow
          </button>

          <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-comic-ink dark:border-neutral-700 text-comic-ink dark:text-neutral-300 bg-comic-bg dark:bg-neutral-800 cursor-pointer">
            <Calendar size={13} />
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="bg-transparent text-xs outline-none cursor-pointer"
            />
          </label>

          <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-comic-ink dark:border-neutral-700 text-comic-ink dark:text-neutral-300 bg-comic-bg dark:bg-neutral-800 cursor-pointer">
            <Clock size={13} />
            <input
              type="time"
              value={dueTime}
              onChange={e => setDueTime(e.target.value)}
              className="bg-transparent text-xs outline-none cursor-pointer"
            />
          </label>
        </div>
      )}
    </form>
  );
};
