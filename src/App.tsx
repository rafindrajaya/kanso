import { useState, useEffect, useMemo } from 'react';
import { useTasks } from './hooks/useTasks';
import { Header } from './components/Header';
import { WizardHero } from './components/WizardHero';
import { TaskInput } from './components/TaskInput';
import { FilterTabs } from './components/FilterTabs';
import { TaskList } from './components/TaskList';
import { getTodayString, isToday } from './lib/dateUtils';

export function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const {
    tasks,
    filter,
    setFilter,
    filteredTasks,
    addTask,
    toggleTask,
    deleteTask,
    reorderTasks,
  } = useTasks();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const counts = useMemo(() => {
    const today = getTodayString();
    return {
      active: tasks.filter(t => !t.completed).length,
      today: tasks.filter(t => !t.completed && t.dueDate && isToday(t.dueDate)).length,
      upcoming: tasks.filter(t => !t.completed && t.dueDate && t.dueDate > today).length,
      completed: tasks.filter(t => t.completed).length,
    };
  }, [tasks]);

  const wizardStats = useMemo(() => {
    const todayTasks = tasks.filter(t => t.dueDate && isToday(t.dueDate));
    const completedToday = todayTasks.filter(t => t.completed).length;
    return {
      completedToday,
      totalToday: todayTasks.length,
      completedTotal: tasks.filter(t => t.completed).length,
    };
  }, [tasks]);

  return (
    <div className="min-h-screen bg-comic-bg dark:bg-[#121212] transition-colors pt-safe pb-safe px-4 md:px-0">
      <div className="max-w-xl mx-auto flex flex-col min-h-screen pb-12">
        {/* Header */}
        <Header
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
          activeCount={counts.active}
        />

        {/* Wizard Character Hero with Speech Bubble & EXP Progress Bar */}
        <div className="my-3">
          <WizardHero
            completedToday={wizardStats.completedToday}
            totalToday={wizardStats.totalToday}
            completedTotal={wizardStats.completedTotal}
          />
        </div>

        {/* Adding New Task Section */}
        <div className="mb-4">
          <TaskInput onAdd={addTask} />
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
          />
        </main>

        {/* Comic Helper Footer */}
        <footer className="mt-8 pt-4 border-t-2 border-comic-ink/10 dark:border-neutral-800 text-center text-xs font-mono text-comic-inkMuted dark:text-neutral-400">
          <p>
            ✦ Drag <span className="font-bold text-comic-ink dark:text-neutral-200">⠿</span> to rearrange • Tap <span className="font-bold text-comic-green dark:text-emerald-400">📅</span> to send to Google Calendar ✦
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
