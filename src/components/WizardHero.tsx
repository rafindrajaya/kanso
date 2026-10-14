import React, { useEffect, useRef } from 'react';
import { playLevelUpSound } from '../lib/audio';

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
  const prevLevelRef = useRef(level);

  // Play retro 8-bit level up chime whenever level increases
  useEffect(() => {
    if (level > prevLevelRef.current) {
      playLevelUpSound();
    }
    prevLevelRef.current = level;
  }, [level]);

  const currentExp = (completedTotal % 3) * 100 + (totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0);
  const targetExp = 300;
  const progressPercent = totalToday > 0 
    ? Math.min(100, Math.round((completedToday / totalToday) * 100)) 
    : (completedTotal > 0 ? 100 : 0);

  return (
    <section className="flex flex-col items-center pt-2 pb-1 text-comic-ink dark:text-neutral-100 transition-colors">
      {/* Small Speech Bubble: Centered on top without quotation marks */}
      <div className="relative mb-3 px-3.5 py-1 bg-white dark:bg-[#1E1E1E] border-2 border-comic-ink dark:border-white rounded-full comic-shadow-sm">
        <span className="text-xs font-bold tracking-tight text-comic-green dark:text-emerald-400 whitespace-nowrap">
          A wizard is never late
        </span>
        <div className="comic-bubble-tail-down" />
      </div>

      {/* Centered Frog Wizard Character (Standing freely without background box) */}
      <div className="w-28 h-28 my-1 flex items-center justify-center">
        <img
          src="/wizard.png"
          alt="Frog Wizard"
          className="w-full h-full object-contain filter drop-shadow-sm mix-blend-multiply dark:mix-blend-normal dark:invert dark:brightness-150 transition-all"
        />
      </div>

      {/* Level Title & Subtext */}
      <div className="w-full flex items-baseline justify-between mt-3 mb-1.5 px-1">
        <h2 className="text-base font-black tracking-tight flex items-center gap-2">
          <span>Frog Wizard</span>
          <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 bg-comic-greenLight dark:bg-emerald-950 text-comic-green dark:text-emerald-300 rounded border border-comic-green/30 dark:border-emerald-500/50">
            lv. {level}
          </span>
        </h2>
        <span className="text-xs font-mono text-comic-inkMuted dark:text-neutral-300 font-semibold">
          {totalToday > 0 ? `${completedToday}/${totalToday} today` : `${completedTotal} conquered`}
        </span>
      </div>

      {/* Comic Progress Bar */}
      <div className="w-full h-4 bg-comic-card dark:bg-[#1E1E1E] rounded-full border-2 border-comic-ink dark:border-white overflow-hidden p-0.5 comic-shadow-sm">
        <div
          className="h-full bg-comic-ink dark:bg-white rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* EXP Ticks */}
      <div className="w-full flex justify-between items-center text-[10px] font-mono font-bold text-comic-inkMuted dark:text-neutral-400 mt-1 px-1">
        <span>{currentExp} exp</span>
        <span>{targetExp} exp</span>
      </div>
    </section>
  );
};
