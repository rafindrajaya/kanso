import { Task, ArchiveResult } from '../types/task';
import { getTodayString, getTomorrowString } from './dateUtils';

const STORAGE_KEY = 'personal_tasks_v1';
export const DEFAULT_RETENTION_DAYS = 30;
export const LIFETIME_STATS_STORAGE_KEY = 'kanso_lifetime_completed_count';

export const INITIAL_TASKS: Task[] = [
  {
    id: 'demo-1',
    title: 'Review today’s priority goals',
    completed: false,
    order: 0,
    dueDate: getTodayString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    title: 'Plan tomorrow’s schedule & deep work blocks',
    completed: false,
    order: 1,
    dueDate: getTomorrowString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    title: 'Test drag-and-drop reordering with handle ⠿',
    completed: false,
    order: 2,
    dueDate: getTodayString(),
    createdAt: new Date().toISOString(),
  },
];

export function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_TASKS;
    const parsed = JSON.parse(raw) as Task[];
    return Array.isArray(parsed) ? parsed : INITIAL_TASKS;
  } catch (error) {
    console.error('Failed to load tasks from localStorage', error);
    return INITIAL_TASKS;
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks to localStorage', error);
  }
}

/**
 * Loads lifetime completed quests count for the Frog Wizard
 */
export function loadLifetimeCompletedCount(): number {
  try {
    const raw = localStorage.getItem(LIFETIME_STATS_STORAGE_KEY);
    if (!raw) return 0;
    const count = parseInt(raw, 10);
    return Number.isFinite(count) && count >= 0 ? count : 0;
  } catch {
    return 0;
  }
}

/**
 * Persists lifetime completed quests count so EXP is never lost
 */
export function saveLifetimeCompletedCount(count: number): void {
  try {
    localStorage.setItem(LIFETIME_STATS_STORAGE_KEY, Math.max(0, count).toString());
  } catch (error) {
    console.error('Failed to save lifetime completed count to localStorage', error);
  }
}

/**
 * Checks if a task completion date exceeds the retention day threshold
 */
export function isTaskOlderThanDays(isoDateString?: string, days = DEFAULT_RETENTION_DAYS): boolean {
  if (!isoDateString) return false;
  const completedTime = new Date(isoDateString).getTime();
  if (Number.isNaN(completedTime)) return false;
  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
  return completedTime < cutoffTime;
}

/**
 * Automatically prunes completed tasks older than the retention threshold (30 days)
 * while safely crediting them into the Frog Wizard's lifetime EXP count.
 */
export function archiveExpiredCompletedTasks(
  tasks: Task[],
  retentionDays = DEFAULT_RETENTION_DAYS
): ArchiveResult {
  const expired: Task[] = [];
  const kept: Task[] = [];

  for (const task of tasks) {
    if (task.completed && isTaskOlderThanDays(task.completedAt, retentionDays)) {
      expired.push(task);
    } else {
      kept.push(task);
    }
  }

  if (expired.length > 0) {
    const currentLifetime = loadLifetimeCompletedCount();
    saveLifetimeCompletedCount(currentLifetime + expired.length);
    saveTasksToStorage(kept);
  }

  return {
    updatedTasks: kept,
    archivedCount: expired.length,
  };
}

/**
 * Manually archives all completed tasks immediately into lifetime EXP
 */
export function archiveAllCompletedTasks(tasks: Task[]): ArchiveResult {
  const completed: Task[] = [];
  const active: Task[] = [];

  for (const task of tasks) {
    if (task.completed) {
      completed.push(task);
    } else {
      active.push(task);
    }
  }

  if (completed.length > 0) {
    const currentLifetime = loadLifetimeCompletedCount();
    saveLifetimeCompletedCount(currentLifetime + completed.length);
    saveTasksToStorage(active);
  }

  return {
    updatedTasks: active,
    archivedCount: completed.length,
  };
}
