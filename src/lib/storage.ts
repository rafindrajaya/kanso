import { Task } from '../types/task';
import { getTodayString, getTomorrowString } from './dateUtils';

const STORAGE_KEY = 'personal_tasks_v1';

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
