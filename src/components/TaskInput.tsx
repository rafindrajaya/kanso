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

  const isEnabled = title.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="bg-comic-card dark:bg-comic-cardDark rounded-2xl border-2 border-comic-ink dark:border-white p-3.5 comic-shadow transition-colors">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-comic-ink dark:text-white p-1 rounded-lg border-2 border-comic-ink dark:border-white hover:bg-comic-bg dark:hover:bg-neutral-800 transition-colors"
          title="Toggle options"
          aria-label="Toggle options"
        >
          <Plus size={16} className={isExpanded ? 'rotate-45 transition-transform' : 'transition-transform'} />
        </button>

        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="New quest or task... (Press Enter)"
          className="flex-1 bg-transparent text-sm md:text-base font-semibold outline-none text-comic-ink dark:text-white placeholder:text-comic-inkMuted/70 dark:placeholder:text-neutral-400"
        />

        {/* Add Button: High-contrast state in both Light and Dark modes */}
        <button
          type="submit"
          disabled={!isEnabled}
          className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide border-2 transition-all ${
            isEnabled
              ? 'bg-comic-ink text-white border-comic-ink dark:bg-white dark:text-comic-ink dark:border-white comic-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer'
              : 'bg-white text-comic-ink border-comic-ink dark:bg-[#1E1E1E] dark:text-white dark:border-white opacity-85 cursor-not-allowed'
          }`}
        >
          + Add
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-2.5 flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => setDueDate(getTodayString())}
            className={`px-2.5 py-1 rounded-lg border-2 font-bold transition-all ${
              dueDate === getTodayString()
                ? 'bg-comic-green text-white border-comic-green dark:border-emerald-400 dark:bg-emerald-600 comic-shadow-sm'
                : 'border-comic-ink dark:border-neutral-400 text-comic-ink dark:text-neutral-100 bg-comic-bg dark:bg-neutral-800'
            }`}
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => setDueDate(getTomorrowString())}
            className={`px-2.5 py-1 rounded-lg border-2 font-bold transition-all ${
              dueDate === getTomorrowString()
                ? 'bg-comic-green text-white border-comic-green dark:border-emerald-400 dark:bg-emerald-600 comic-shadow-sm'
                : 'border-comic-ink dark:border-neutral-400 text-comic-ink dark:text-neutral-100 bg-comic-bg dark:bg-neutral-800'
            }`}
          >
            Tomorrow
          </button>

          <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-comic-ink dark:border-neutral-400 text-comic-ink dark:text-neutral-100 bg-comic-bg dark:bg-neutral-800 cursor-pointer font-bold">
            <Calendar size={13} />
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="bg-transparent text-xs outline-none cursor-pointer dark:text-white"
            />
          </label>

          <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-comic-ink dark:border-neutral-400 text-comic-ink dark:text-neutral-100 bg-comic-bg dark:bg-neutral-800 cursor-pointer font-bold">
            <Clock size={13} />
            <input
              type="time"
              value={dueTime}
              onChange={e => setDueTime(e.target.value)}
              className="bg-transparent text-xs outline-none cursor-pointer dark:text-white"
            />
          </label>
        </div>
      )}
    </form>
  );
};
