import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  activeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="flex items-center justify-between py-3 mb-2">
      {/* Top Left: KANSO and Japanese Kanji 簡素 */}
      <div className="flex items-center gap-2">
        <h1 className="text-xl md:text-2xl font-black tracking-widest uppercase text-comic-ink dark:text-neutral-100">
          KANSO
        </h1>
        <span className="text-sm md:text-base font-bold text-comic-green dark:text-emerald-400 tracking-wider">
          簡素
        </span>
      </div>

      {/* Top Right: Theme Toggle */}
      <button
        type="button"
        onClick={onToggleDarkMode}
        className="w-9 h-9 rounded-xl bg-comic-card dark:bg-comic-cardDark border-2 border-comic-ink dark:border-neutral-200 shadow-comic flex items-center justify-center text-comic-ink dark:text-neutral-100 hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        aria-label="Toggle theme"
        title="Toggle dark/light mode"
      >
        {isDarkMode ? <Sun size={17} strokeWidth={2.5} /> : <Moon size={17} strokeWidth={2.5} />}
      </button>
    </header>
  );
};
