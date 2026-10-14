import React from 'react';
import { Sparkles } from 'lucide-react';

interface WizardHeroProps {
  completedToday: number;
  totalToday: number;
  completedTotal: number;
}

export const WizardHero: React.FC<WizardHeroProps> = ({
  completedToday,
  totalToday,
  completedTotal,
}) => {
  // Wizard level increases every 3 completed tasks
  const level = Math.floor(completedTotal / 3) + 1;
  const currentExp = (completedTotal % 3) * 100 + (totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0);
  const targetExp = 300;

  // Percentage for today's daily focus progress bar
  const progressPercent = totalToday > 0 ? Math.min(100, Math.round((completedToday / totalToday) * 100)) : (completedTotal > 0 ? 100 : 0);

  return (
    <div className="bg-comic-card dark:bg-comic-cardDark rounded-2xl border-2 border-comic-ink dark:border-neutral-200 shadow-comic p-4 text-comic-ink dark:text-neutral-100 transition-all">
      {/* Character + Speech Bubble Header */}
      <div className="flex items-end gap-3.5 mb-3">
        {/* Frog Wizard Avatar */}
        <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 border-comic-ink dark:border-neutral-200 bg-comic-bg">
          <img
            src="/wizard.jpg"
            alt="Frog Wizard"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Comic Speech Bubble */}
        <div className="relative flex-1 bg-white dark:bg-neutral-900 border-2 border-comic-ink dark:border-neutral-200 rounded-xl px-3.5 py-2 shadow-comic-sm">
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold tracking-tight text-comic-green dark:text-emerald-400">
            <Sparkles size={14} className="shrink-0 animate-pulse text-amber-500" />
            <span>&ldquo;A wizard is never late&rdquo;</span>
          </div>
          <p className="text-[11px] text-comic-inkMuted dark:text-neutral-400 mt-0.5">
            Nor is he early, he arrives precisely when he means to.
          </p>
          <div className="comic-bubble-tail" />
        </div>
      </div>

      {/* Level Title & Subtext (Paladin Reference Style) */}
      <div className="flex items-baseline justify-between mb-1.5">
        <h2 className="text-base md:text-lg font-black tracking-tight flex items-center gap-1.5">
          <span>Frog Wizard</span>
          <span className="text-xs font-mono font-semibold px-1.5 py-0.5 bg-comic-greenLight dark:bg-emerald-950/60 text-comic-green dark:text-emerald-300 rounded border border-comic-green/30">
            lv. {level}
          </span>
        </h2>
        <span className="text-xs font-mono text-comic-inkMuted dark:text-neutral-400">
          {totalToday > 0 ? `${completedToday}/${totalToday} today` : `${completedTotal} conquered`}
        </span>
      </div>

      {/* Comic Progress Bar (IMG_8965 Paladin Style) */}
      <div className="relative w-full h-4 bg-comic-bg dark:bg-neutral-800 rounded-full border-2 border-comic-ink dark:border-neutral-200 overflow-hidden p-0.5">
        <div
          className="h-full bg-comic-ink dark:bg-neutral-200 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* EXP Ticks */}
      <div className="flex justify-between items-center text-[10px] font-mono text-comic-inkMuted dark:text-neutral-400 mt-1">
        <span>{currentExp} exp</span>
        <span>{targetExp} exp</span>
      </div>
    </div>
  );
};
