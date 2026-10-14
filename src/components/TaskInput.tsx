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
    <form onSubmit={handleSubmit} className="bg-white dark:bg-paper-darkCard rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 shadow-sm transition-all focus-within:ring-2 focus-within:ring-notion-blue/30 focus-within:border-notion-blue">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-ink-secondary dark:text-ink-darkSecondary hover:text-notion-blue p-1 rounded transition-colors"
          title="Toggle extra options"
        >
          <Plus size={20} className={isExpanded ? 'rotate-45 transition-transform' : 'transition-transform'} />
        </button>

        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Add a new task... (Press Enter to save)"
          className="flex-1 bg-transparent text-sm md:text-base outline-none text-ink-primary dark:text-ink-darkPrimary placeholder:text-neutral-400"
        />

        <button
          type="submit"
          disabled={!title.trim()}
          className="px-3 py-1.5 bg-notion-blue text-white rounded-lg text-xs md:text-sm font-medium hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Add
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-wrap items-center gap-2 text-xs">
          {/* Quick date chips */}
          <button
            type="button"
            onClick={() => setDueDate(getTodayString())}
            className={`px-2.5 py-1 rounded-md border transition-colors ${
              dueDate === getTodayString()
                ? 'bg-blue-50 border-notion-blue text-notion-blue dark:bg-blue-950/40'
                : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
            }`}
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => setDueDate(getTomorrowString())}
            className={`px-2.5 py-1 rounded-md border transition-colors ${
              dueDate === getTomorrowString()
                ? 'bg-blue-50 border-notion-blue text-notion-blue dark:bg-blue-950/40'
                : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
            }`}
          >
            Tomorrow
          </button>

          {/* Date Picker */}
          <label className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 cursor-pointer">
            <Calendar size={13} />
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="bg-transparent text-xs outline-none cursor-pointer"
            />
          </label>

          {/* Time Picker */}
          <label className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 cursor-pointer">
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
