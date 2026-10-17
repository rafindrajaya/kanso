/**
 * Core Task data definitions
 */

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  dueDate?: string; // Format: YYYY-MM-DD
  dueTime?: string; // Format: HH:mm
  notes?: string;
  createdAt: string; // ISO 8601 string
  completedAt?: string;
}

export type FilterView = 'active' | 'today' | 'upcoming' | 'completed';

export interface NewTaskInput {
  title: string;
  dueDate?: string;
  dueTime?: string;
  notes?: string;
}

export interface CalendarSyncSettings {
  autoSync: boolean;
  syncMode: 'intent' | 'api';
  googleClientId?: string;
}

export interface ArchiveResult {
  updatedTasks: Task[];
  archivedCount: number;
}
