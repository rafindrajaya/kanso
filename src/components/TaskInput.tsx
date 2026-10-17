import React, { useState } from 'react';
import { Plus, Calendar, Clock, FileText } from 'lucide-react';
import { NewTaskInput } from '../types/task';
import { getTodayString, getTomorrowString } from '../lib/dateUtils';

interface TaskInputProps {
  onAdd: (input: NewTaskInput) => void;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAdd }): React.JSX.Element => {
  const [title, setTitle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(getTodayString());
  const [dueTime, setDueTime] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setNotes('');
    setIsExpanded(false);
  };

  const isEnabled = title.trim().length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-comic-card dark:bg-comic-cardDark rounded-2xl border-2 border-comic-ink dark:border-white p-3.5 comic-shadow transition-colors"
    >
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          className="min-w-[44px] min-h-[44px] text-comic-ink dark:text-white p-2 rounded-xl border-2 border-comic-ink dark:border-white hover:bg-comic-bg dark:hover:bg-neutral-800 transition-colors flex items-center justify-center shrink-0"
          title="Toggle options & notes"
          aria-label="Toggle options & notes"
        >
          <Plus
            size={18}
            className={isExpanded ? 'rotate-45 transition-transform' : 'transition-transform'}
          />
        </button>

        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="New quest or task... (Press Enter)"
          className="flex-1 min-w-0 bg-transparent text-sm md:text-base font-semibold outline-none text-[#0F0F0F] dark:text-white placeholder:text-comic-inkMuted/70 dark:placeholder:text-neutral-400 py-1"
        />

        {/* Add Button: 44px touch target on mobile */}
        <button
          type="submit"
          disabled={!isEnabled}
          className={`min-h-[44px] px-4 rounded-xl text-xs font-black tracking-wide border-2 transition-all flex items-center justify-center shrink-0 ${
            isEnabled
              ? 'bg-[#0F0F0F] text-white border-[#0F0F0F] dark:bg-white dark:text-[#0F0F0F] dark:border-white comic-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer'
              : 'bg-white text-[#0F0F0F] border-[#0F0F0F] dark:bg-[#1E1E1E] dark:text-white dark:border-white opacity-85 cursor-not-allowed'
          }`}
        >
          + Add
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-2.5 border-t border-comic-ink/15 dark:border-white/15 space-y-2.5">
          {/* Quick Date and Time buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => setDueDate(getTodayString())}
              className={`min-h-[44px] px-3 py-1.5 rounded-lg border-2 font-bold transition-all ${
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
              className={`min-h-[44px] px-3 py-1.5 rounded-lg border-2 font-bold transition-all ${
                dueDate === getTomorrowString()
                  ? 'bg-comic-green text-white border-comic-green dark:border-emerald-400 dark:bg-emerald-600 comic-shadow-sm'
                  : 'border-comic-ink dark:border-neutral-400 text-comic-ink dark:text-neutral-100 bg-comic-bg dark:bg-neutral-800'
              }`}
            >
              Tomorrow
            </button>

            <label className="min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-comic-ink dark:border-neutral-400 text-comic-ink dark:text-neutral-100 bg-comic-bg dark:bg-neutral-800 cursor-pointer font-bold">
              <Calendar size={14} />
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="bg-transparent text-xs outline-none cursor-pointer dark:text-white"
              />
            </label>

            <label className="min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-comic-ink dark:border-neutral-400 text-comic-ink dark:text-neutral-100 bg-comic-bg dark:bg-neutral-800 cursor-pointer font-bold">
              <Clock size={14} />
              <input
                type="time"
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
                className="bg-transparent text-xs outline-none cursor-pointer dark:text-white"
              />
            </label>
          </div>

          {/* Description / Notes field on creation */}
          <div>
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-comic-inkMuted dark:text-neutral-400 mb-1">
              <FileText size={12} />
              Notes & Details (Optional)
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add details, notes, or bullet points here..."
              rows={2}
              className="w-full p-2.5 rounded-xl border-2 border-comic-ink/20 dark:border-white/20 bg-comic-bg/60 dark:bg-neutral-900/60 text-xs font-mono text-[#0F0F0F] dark:text-white placeholder:text-comic-inkMuted/60 dark:placeholder:text-neutral-500 focus:outline-none focus:border-comic-ink dark:focus:border-white transition-all resize-y"
            />
          </div>
        </div>
      )}
    </form>
  );
};
