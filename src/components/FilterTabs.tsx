import React from 'react';
import { FilterView } from '../types/task';
import { ListFilter, Calendar, CalendarDays, CheckCircle } from 'lucide-react';

interface FilterTabsProps {
  currentFilter: FilterView;
  onFilterChange: (filter: FilterView) => void;
  counts: {
    active: number;
    today: number;
    upcoming: number;
    completed: number;
  };
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  currentFilter,
  onFilterChange,
  counts,
}) => {
  const tabs: { key: FilterView; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'active', label: 'All', icon: <ListFilter size={14} />, count: counts.active },
    { key: 'today', label: 'Today', icon: <Calendar size={14} />, count: counts.today },
    { key: 'upcoming', label: 'Upcoming', icon: <CalendarDays size={14} />, count: counts.upcoming },
    { key: 'completed', label: 'Done', icon: <CheckCircle size={14} />, count: counts.completed },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-comic-card dark:bg-comic-cardDark border-2 border-comic-ink dark:border-neutral-200 rounded-2xl shadow-comic overflow-x-auto no-scrollbar">
      {tabs.map(tab => {
        const isActive = currentFilter === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onFilterChange(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-2 ${
              isActive
                ? 'bg-comic-ink text-white dark:bg-neutral-100 dark:text-comic-ink border-comic-ink dark:border-neutral-200 shadow-comic-sm'
                : 'border-transparent text-comic-ink dark:text-neutral-300 hover:border-comic-ink/20 dark:hover:border-neutral-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${
                isActive
                  ? 'bg-white text-comic-ink border-comic-ink dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700'
                  : 'bg-comic-bg text-comic-ink border-comic-ink/30 dark:bg-neutral-800 dark:text-neutral-300'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
