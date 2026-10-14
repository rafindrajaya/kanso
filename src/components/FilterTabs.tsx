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
    { key: 'active', label: 'All Tasks', icon: <ListFilter size={15} />, count: counts.active },
    { key: 'today', label: 'Today', icon: <Calendar size={15} />, count: counts.today },
    { key: 'upcoming', label: 'Upcoming', icon: <CalendarDays size={15} />, count: counts.upcoming },
    { key: 'completed', label: 'Done', icon: <CheckCircle size={15} />, count: counts.completed },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-x-auto no-scrollbar">
      {tabs.map(tab => {
        const isActive = currentFilter === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onFilterChange(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              isActive
                ? 'bg-white dark:bg-paper-darkCard text-ink-primary dark:text-ink-darkPrimary shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <span className={isActive ? 'text-notion-blue' : ''}>{tab.icon}</span>
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold'
                  : 'text-neutral-400 dark:text-neutral-500'
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
