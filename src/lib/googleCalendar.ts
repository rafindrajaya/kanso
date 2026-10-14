import { Task } from '../types/task';
import { getTodayString } from './dateUtils';

/**
 * Generates ISO UTC calendar dates string (e.g. 20261015/20261016 for all-day
 * or 20261015T140000Z/20261015T150000Z for timed events)
 */
function buildDateRangeParam(dueDate?: string, dueTime?: string): string {
  const targetDate = dueDate || getTodayString();
  const cleanDate = targetDate.replace(/-/g, '');

  if (!dueTime) {
    // All-day event: start date to next day in YYYYMMDD format
    const [year, month, day] = targetDate.split('-').map(Number);
    const nextDay = new Date(year, month - 1, day + 1);
    const nextYear = nextDay.getFullYear();
    const nextMonth = String(nextDay.getMonth() + 1).padStart(2, '0');
    const nextDate = String(nextDay.getDate()).padStart(2, '0');
    return `${cleanDate}/${nextYear}${nextMonth}${nextDate}`;
  }

  // Timed event: format 1 hour duration block
  const [hours, minutes] = dueTime.split(':').map(Number);
  const start = new Date(targetDate);
  start.setHours(hours, minutes, 0, 0);

  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour later

  const formatUTC = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return `${formatUTC(start)}/${formatUTC(end)}`;
}

/**
 * Builds Google Calendar web intent URL from a task
 */
export function buildGoogleCalendarUrl(task: Task): string {
  const baseUrl = 'https://calendar.google.com/calendar/render';
  const dates = buildDateRangeParam(task.dueDate, task.dueTime);
  const text = encodeURIComponent(task.title);
  
  const notes = task.notes 
    ? encodeURIComponent(`${task.notes}\n\n(Created via Personal Task Manager)`)
    : encodeURIComponent('Created via Personal Task Manager');

  return `${baseUrl}?action=TEMPLATE&text=${text}&dates=${dates}&details=${notes}`;
}

/**
 * Directly opens Google Calendar in browser or native iOS app
 */
export function shareTaskToGoogleCalendar(task: Task): void {
  const url = buildGoogleCalendarUrl(task);
  window.open(url, '_blank', 'noopener,noreferrer');
}
