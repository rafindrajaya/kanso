import React, { useState, useEffect, useMemo } from 'react';
import { useTasks } from './hooks/useTasks';
import { Header } from './components/Header';
import { WizardHero } from './components/WizardHero';
import { TaskInput } from './components/TaskInput';
import { FilterTabs } from './components/FilterTabs';
import { TaskList } from './components/TaskList';
import { CalendarSettingsModal } from './components/CalendarSettingsModal';
import { getTodayString, isToday } from './lib/dateUtils';
import {
  getCalendarSyncSettings,
  isGoogleCalendarConnected,
  autoSyncNewTask,
} from './lib/googleCalendar';
import { CalendarSyncSettings, NewTaskInput } from './types/task';
import { Check, CalendarSync } from 'lucide-react';

export function App(): React.JSX.Element {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('kanso-theme');
    if (saved) return saved === 'dark';
    return false;
  });

  const [calendarSettings, setCalendarSettings] = useState<CalendarSyncSettings>(() =>
    getCalendarSyncSettings()
  );
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<{ message: string; isInfo?: boolean } | null>(null);

  const {
    tasks,
    filter,
    setFilter,
    filteredTasks,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    reorderTasks,
  } = useTasks();

  useEffect(() => {
    localStorage.setItem('kanso-theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleAddTask = (input: NewTaskInput): void => {
    const created = addTask(input);
    if (calendarSettings.autoSync) {
      void autoSyncNewTask(created).then((result) => {
        if (result.status === 'synced_silently') {
          setSyncToast({ message: `"${created.title}" synced to Google Calendar silently ✦` });
          setTimeout(() => setSyncToast(null), 3500);
        } else if (result.status === 'not_authenticated') {
          setSyncToast({
            message: 'Connect Google Calendar to enable silent background sync',
            isInfo: true,
          });
          setTimeout(() => setSyncToast(null), 4000);
        }
      });
    }
  };

  const counts = useMemo(() => {
    const today = getTodayString();
    return {
      active: tasks.filter((t) => !t.completed).length,
      today: tasks.filter((t) => !t.completed && t.dueDate && isToday(t.dueDate)).length,
      upcoming: tasks.filter((t) => !t.completed && t.dueDate && t.dueDate > today).length,
      completed: tasks.filter((t) => t.completed).length,
    };
  }, [tasks]);

  const wizardStats = useMemo(() => {
    const todayTasks = tasks.filter((t) => t.dueDate && isToday(t.dueDate));
    const completedToday = todayTasks.filter((t) => t.completed).length;
    return {
      completedToday,
      totalToday: todayTasks.length,
      completedTotal: tasks.filter((t) => t.completed).length,
    };
  }, [tasks]);

  return (
    <div className="min-h-screen bg-comic-bg dark:bg-[#121212] transition-colors pt-safe pb-safe px-4 md:px-0">
      <div className="max-w-xl mx-auto flex flex-col min-h-screen pb-12">
        {/* Header */}
        <Header
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
          activeCount={counts.active}
          autoSyncCalendar={calendarSettings.autoSync}
          isCalendarConnected={isGoogleCalendarConnected()}
          onOpenCalendarSettings={() => setIsCalendarModalOpen(true)}
        />

        {/* Wizard Character Hero with Speech Bubble & EXP Progress Bar */}
        <div className="my-3">
          <WizardHero
            completedToday={wizardStats.completedToday}
            totalToday={wizardStats.totalToday}
            completedTotal={wizardStats.completedTotal}
          />
        </div>

        {/* Sync Toast Feedback Banner */}
        {syncToast && (
          <div
            className={`mb-3 px-3 py-2 text-white rounded-xl border-2 border-comic-ink dark:border-white comic-shadow-sm flex items-center gap-2 text-xs font-mono font-bold transition-all ${
              syncToast.isInfo ? 'bg-amber-600 dark:bg-amber-700' : 'bg-comic-green dark:bg-emerald-600'
            }`}
          >
            {syncToast.isInfo ? (
              <CalendarSync size={14} />
            ) : (
              <Check size={14} strokeWidth={3} />
            )}
            <span className="truncate flex-1">{syncToast.message}</span>
            <button
              type="button"
              onClick={() => setSyncToast(null)}
              className="text-white hover:opacity-80 p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Adding New Task Section */}
        <div className="mb-4">
          <TaskInput onAdd={handleAddTask} />
        </div>

        {/* Filter Navigation */}
        <div className="mb-4">
          <FilterTabs
            currentFilter={filter}
            onFilterChange={setFilter}
            counts={counts}
          />
        </div>

        {/* Draggable Task List */}
        <main className="flex-1">
          <TaskList
            tasks={filteredTasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onReorder={reorderTasks}
            onUpdate={updateTask}
          />
        </main>

        {/* Comic Helper Footer */}
        <footer className="mt-8 pt-2 text-center text-xs font-mono text-comic-inkMuted dark:text-neutral-400">
          <p>
            ✦ Drag <span className="font-bold text-[#0F0F0F] dark:text-neutral-200">⠿</span> to rearrange • Tap task to view full name & notes •{' '}
            <button
              type="button"
              onClick={() => setIsCalendarModalOpen(true)}
              className="underline font-bold text-comic-green dark:text-emerald-400 hover:opacity-80"
            >
              📅 G-Cal Silent Sync: {calendarSettings.autoSync && isGoogleCalendarConnected() ? 'ON' : 'Settings'}
            </button>{' '}
            ✦
          </p>
        </footer>

        {/* Google Calendar Connection & Silent Sync Modal */}
        <CalendarSettingsModal
          isOpen={isCalendarModalOpen}
          onClose={() => setIsCalendarModalOpen(false)}
          onSettingsChanged={(newSettings) => setCalendarSettings(newSettings)}
        />
      </div>
    </div>
  );
}

export default App;
