import React from 'react';
import { Sun, Moon, CalendarCheck2 } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  activeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
  activeCount,
}) => {
  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="flex items-center justify-between py-4 border-b border-neutral-200/80 dark:border-neutral-800">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-notion-blue/10 text-notion-blue flex items-center justify-center">
          <CalendarCheck2 size={18} />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-ink-primary dark:text-ink-darkPrimary">
            Kanso
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {todayFormatted} • {activeCount} remaining
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleDarkMode}
        className="p-2 rounded-xl text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        aria-label="Toggle theme"
        title="Toggle dark/light mode"
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
};
