import { Task, CalendarSyncSettings } from '../types/task';
import { getTodayString } from './dateUtils';

interface TokenResponse {
  access_token?: string;
  error?: string;
  expires_in?: number;
}

interface TokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

interface GoogleOAuth2 {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
    error_callback?: (error: unknown) => void;
  }) => TokenClient;
}

interface GoogleAccounts {
  oauth2: GoogleOAuth2;
}

declare global {
  interface Window {
    google?: {
      accounts?: GoogleAccounts;
    };
  }
}

const CALENDAR_SYNC_STORAGE_KEY = 'kanso_calendar_sync_settings';
const GCAL_TOKEN_STORAGE_KEY = 'kanso_gcal_token';

export const DEFAULT_CALENDAR_SYNC_SETTINGS: CalendarSyncSettings = {
  autoSync: false,
  syncMode: 'api',
};

// In-memory cache for active GIS client and access token
let activeTokenClient: TokenClient | null = null;
let cachedAccessToken: string | null = null;

/**
 * Retrieves cached Google access token from memory or sessionStorage
 */
export function getCachedGoogleAccessToken(): string | null {
  if (cachedAccessToken) return cachedAccessToken;
  try {
    const saved = sessionStorage.getItem(GCAL_TOKEN_STORAGE_KEY);
    if (saved) {
      cachedAccessToken = saved;
      return saved;
    }
  } catch {
    // Session storage not accessible
  }
  return null;
}

/**
 * Updates or clears the cached Google access token
 */
export function setCachedGoogleAccessToken(token: string | null): void {
  cachedAccessToken = token;
  try {
    if (token) {
      sessionStorage.setItem(GCAL_TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(GCAL_TOKEN_STORAGE_KEY);
    }
  } catch {
    // Session storage write error ignored
  }
}

/**
 * Checks if active Google Calendar connection exists
 */
export function isGoogleCalendarConnected(): boolean {
  return !!getCachedGoogleAccessToken();
}

/**
 * Disconnects Google Calendar and clears stored credentials
 */
export function disconnectGoogleCalendar(): void {
  setCachedGoogleAccessToken(null);
  const current = getCalendarSyncSettings();
  saveCalendarSyncSettings({ ...current, autoSync: false });
}

/**
 * Generates ISO UTC calendar dates string (e.g. 20261015/20261016 for all-day
 * or 20261015T140000Z/20261015T150000Z for timed events)
 */
function buildDateRangeParam(dueDate?: string, dueTime?: string): string {
  const targetDate = dueDate || getTodayString();
  const cleanDate = targetDate.replace(/-/g, '');

  if (!dueTime) {
    const [year, month, day] = targetDate.split('-').map(Number);
    const nextDay = new Date(year, month - 1, day + 1);
    const nextYear = nextDay.getFullYear();
    const nextMonth = String(nextDay.getMonth() + 1).padStart(2, '0');
    const nextDate = String(nextDay.getDate()).padStart(2, '0');
    return `${cleanDate}/${nextYear}${nextMonth}${nextDate}`;
  }

  const [hours, minutes] = dueTime.split(':').map(Number);
  const start = new Date(targetDate);
  start.setHours(hours, minutes, 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const formatUTC = (d: Date): string =>
    d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return `${formatUTC(start)}/${formatUTC(end)}`;
}

/**
 * Builds Google Calendar web intent URL for manual per-task sharing
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
 * Manually opens Google Calendar in browser (only called on explicit button click)
 */
export function shareTaskToGoogleCalendar(task: Task): void {
  const url = buildGoogleCalendarUrl(task);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Reads calendar sync preferences from localStorage
 */
export function getCalendarSyncSettings(): CalendarSyncSettings {
  try {
    const raw = localStorage.getItem(CALENDAR_SYNC_STORAGE_KEY);
    if (!raw) return DEFAULT_CALENDAR_SYNC_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<CalendarSyncSettings>;
    return {
      autoSync: typeof parsed.autoSync === 'boolean' ? parsed.autoSync : DEFAULT_CALENDAR_SYNC_SETTINGS.autoSync,
      syncMode: 'api',
      googleClientId: typeof parsed.googleClientId === 'string' ? parsed.googleClientId : undefined,
    };
  } catch (error) {
    console.error('Failed to load calendar sync settings from localStorage', error);
    return DEFAULT_CALENDAR_SYNC_SETTINGS;
  }
}

/**
 * Persists calendar sync preferences to localStorage
 */
export function saveCalendarSyncSettings(settings: CalendarSyncSettings): void {
  try {
    localStorage.setItem(CALENDAR_SYNC_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save calendar sync settings to localStorage', error);
  }
}

/**
 * Builds standard Google Calendar API event resource from task
 */
function buildEventResource(task: Task): Record<string, unknown> {
  const targetDate = task.dueDate || getTodayString();
  const description = task.notes
    ? `${task.notes}\n\n(Created via Personal Task Manager)`
    : 'Created via Personal Task Manager';

  if (!task.dueTime) {
    const [year, month, day] = targetDate.split('-').map(Number);
    const nextDay = new Date(year, month - 1, day + 1);
    const nextYear = nextDay.getFullYear();
    const nextMonth = String(nextDay.getMonth() + 1).padStart(2, '0');
    const nextDate = String(nextDay.getDate()).padStart(2, '0');
    return {
      summary: task.title,
      description,
      start: { date: targetDate },
      end: { date: `${nextYear}-${nextMonth}-${nextDate}` },
    };
  }

  const [hours, minutes] = task.dueTime.split(':').map(Number);
  const [y, m, d] = targetDate.split('-').map(Number);
  const start = new Date(y, m - 1, d, hours, minutes, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  return {
    summary: task.title,
    description,
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
  };
}

/**
 * Silently creates an event in Google Calendar using the REST API
 */
export async function createGoogleCalendarEventViaApi(
  task: Task,
  accessToken: string
): Promise<boolean> {
  try {
    const eventBody = buildEventResource(task);
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventBody),
    });
    return res.ok;
  } catch (error) {
    console.error('Failed to silently create Google Calendar event via API', error);
    return false;
  }
}

/**
 * Requests OAuth access token using Google Identity Services token client
 */
export function requestGoogleAccessToken(
  clientId: string,
  onToken: (token: string) => void,
  onError?: (err: unknown) => void
): void {
  if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
    onError?.('Google Identity Services script is not ready.');
    return;
  }

  activeTokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId.trim(),
    scope: 'https://www.googleapis.com/auth/calendar.events',
    callback: (response: TokenResponse) => {
      if (response.access_token) {
        setCachedGoogleAccessToken(response.access_token);
        onToken(response.access_token);
      } else if (response.error) {
        onError?.(response.error);
      }
    },
    error_callback: (err: unknown) => {
      onError?.(err);
    },
  });

  activeTokenClient.requestAccessToken({ prompt: '' });
}

export interface AutoSyncResult {
  synced: boolean;
  status: 'synced_silently' | 'not_authenticated' | 'disabled' | 'failed';
}

/**
 * Triggers 100% silent Google Calendar background sync for new tasks.
 * NEVER opens browser tabs or redirects the user.
 */
export async function autoSyncNewTask(task: Task): Promise<AutoSyncResult> {
  const settings = getCalendarSyncSettings();
  if (!settings.autoSync) {
    return { synced: false, status: 'disabled' };
  }

  const token = getCachedGoogleAccessToken();
  if (!token) {
    return { synced: false, status: 'not_authenticated' };
  }

  const success = await createGoogleCalendarEventViaApi(task, token);
  return {
    synced: success,
    status: success ? 'synced_silently' : 'failed',
  };
}
