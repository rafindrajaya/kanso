/**
 * Date utility functions for task scheduling and comparisons
 */

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isPastDue(dueDate: string): boolean {
  return dueDate < getTodayString();
}

export function isToday(dueDate: string): boolean {
  return dueDate === getTodayString();
}

export function formatFriendlyDate(dueDate?: string): string {
  if (!dueDate) return '';

  const today = getTodayString();
  const tomorrow = getTomorrowString();

  if (dueDate === today) return 'Today';
  if (dueDate === tomorrow) return 'Tomorrow';
  if (dueDate < today) return 'Overdue';

  // Format as e.g. "Oct 16"
  const [year, month, day] = dueDate.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
