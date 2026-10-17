import React from 'react';
import { Sun, Moon, CalendarSync } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  activeCount: number;
  autoSyncCalendar?: boolean;
  isCalendarConnected?: boolean;
  onOpenCalendarSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
  autoSyncCalendar = false,
  isCalendarConnected = false,
  onOpenCalendarSettings,
}): React.JSX.Element => {
  return (
    <header className="flex items-center justify-between py-3 mb-2">
      {/* Top Left: KANSO and Japanese Kanji 簡素 */}
      <div className="flex items-center gap-2">
        <h1 className="text-xl md:text-2xl font-black tracking-widest uppercase text-[#0F0F0F] dark:text-white">
          KANSO
        </h1>
        <span className="text-sm md:text-base font-bold text-comic-green dark:text-emerald-400 tracking-wider">
          簡素
        </span>
      </div>

      {/* Top Right: Controls with 44px touch targets */}
      <div className="flex items-center gap-2">
        {/* Google Calendar Silent Sync Quick Button */}
        {onOpenCalendarSettings && (
          <button
            type="button"
            onClick={onOpenCalendarSettings}
            className={`min-h-[44px] px-3 rounded-xl border-2 border-comic-ink dark:border-white comic-shadow flex items-center gap-1.5 text-xs font-mono font-bold transition-all hover:translate-x-0.5 hover:translate-y-0.5 ${
              autoSyncCalendar && isCalendarConnected
                ? 'bg-comic-green text-white dark:bg-emerald-600'
                : 'bg-comic-card dark:bg-comic-cardDark text-comic-inkMuted dark:text-neutral-300'
            }`}
            aria-label="Google Calendar Settings"
            title={
              isCalendarConnected
                ? `Google Calendar Silent Sync: ${autoSyncCalendar ? 'ON' : 'OFF'}`
                : 'Connect Google Calendar for Silent Sync'
            }
          >
            <CalendarSync size={16} />
            <span className="text-xs">
              {!isCalendarConnected
                ? 'G-Cal: Connect'
                : autoSyncCalendar
                ? 'Sync: ON'
                : 'Sync: OFF'}
            </span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="min-w-[44px] min-h-[44px] rounded-xl bg-comic-card dark:bg-comic-cardDark border-2 border-comic-ink dark:border-white comic-shadow flex items-center justify-center text-comic-ink dark:text-neutral-100 hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all"
          aria-label="Toggle theme"
          title="Toggle dark/light mode"
        >
          {isDarkMode ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
        </button>
      </div>
    </header>
  );
};
