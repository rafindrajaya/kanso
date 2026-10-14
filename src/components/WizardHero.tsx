import React from 'react';

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
  const progressPercent = totalToday > 0 
    ? Math.min(100, Math.round((completedToday / totalToday) * 100)) 
    : (completedTotal > 0 ? 100 : 0);

  return (
    <div className="bg-comic-card dark:bg-comic-cardDark rounded-2xl border-2 border-comic-ink dark:border-neutral-200 shadow-comic p-4 text-comic-ink dark:text-neutral-100 flex flex-col items-center">
      {/* Small Speech Bubble on Top pointing directly down to character */}
      <div className="relative mb-2.5 px-3 py-1 bg-white dark:bg-neutral-900 border-2 border-comic-ink dark:border-neutral-200 rounded-full shadow-comic-sm">
        <span className="text-xs font-bold tracking-tight text-comic-green dark:text-emerald-400 whitespace-nowrap">
          &ldquo;A wizard is never late&rdquo;
        </span>
        <div className="comic-bubble-tail-down" />
      </div>

      {/* Centered Frog Wizard Character with Transparent Background */}
      <div className="w-24 h-24 my-1 flex items-center justify-center">
        <img
          src="/wizard.png"
          alt="Frog Wizard"
          className="w-full h-full object-contain filter drop-shadow-sm"
        />
      </div>

      {/* Level Title & Subtext (Paladin Reference Style) */}
      <div className="w-full flex items-baseline justify-between mt-2 mb-1.5 px-0.5">
        <h2 className="text-base font-black tracking-tight flex items-center gap-1.5">
          <span>Frog Wizard</span>
          <span className="text-[11px] font-mono font-bold px-1.5 py-0.2 bg-comic-greenLight dark:bg-emerald-950/60 text-comic-green dark:text-emerald-300 rounded border border-comic-green/30">
            lv. {level}
          </span>
        </h2>
        <span className="text-xs font-mono text-comic-inkMuted dark:text-neutral-400">
          {totalToday > 0 ? `${completedToday}/${totalToday} today` : `${completedTotal} conquered`}
        </span>
      </div>

      {/* Comic Progress Bar */}
      <div className="w-full h-4 bg-comic-bg dark:bg-neutral-800 rounded-full border-2 border-comic-ink dark:border-neutral-200 overflow-hidden p-0.5">
        <div
          className="h-full bg-comic-ink dark:bg-neutral-200 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* EXP Ticks */}
      <div className="w-full flex justify-between items-center text-[10px] font-mono text-comic-inkMuted dark:text-neutral-400 mt-1 px-0.5">
        <span>{currentExp} exp</span>
        <span>{targetExp} exp</span>
      </div>
    </div>
  );
};
