import React from 'react';
import { Sun, Moon, LayoutGrid } from 'lucide-react';

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
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="flex items-center justify-between py-3 mb-2">
      {/* Left Icon Button (IMG_8965 RPG Grid Menu style) */}
      <div className="w-10 h-10 rounded-2xl bg-comic-card dark:bg-comic-cardDark border-2 border-comic-ink dark:border-neutral-200 shadow-comic flex items-center justify-center text-comic-ink dark:text-neutral-100">
        <LayoutGrid size={18} strokeWidth={2.5} />
      </div>

      {/* Center Branding */}
      <div className="text-center">
        <h1 className="text-lg md:text-xl font-black tracking-widest uppercase text-comic-ink dark:text-neutral-100">
          KANSO
        </h1>
        <p className="text-[11px] font-mono text-comic-inkMuted dark:text-neutral-400">
          {todayFormatted} • {activeCount} quests
        </p>
      </div>

      {/* Right Theme Toggle (IMG_8965 Action Button style) */}
      <button
        type="button"
        onClick={onToggleDarkMode}
        className="w-10 h-10 rounded-2xl bg-comic-card dark:bg-comic-cardDark border-2 border-comic-ink dark:border-neutral-200 shadow-comic flex items-center justify-center text-comic-ink dark:text-neutral-100 hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        aria-label="Toggle theme"
        title="Toggle dark/light mode"
      >
        {isDarkMode ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
      </button>
    </header>
  );
};
