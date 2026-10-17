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
const GCAL_EXPIRY_STORAGE_KEY = 'kanso_gcal_token_expires_at';

export const DEFAULT_CALENDAR_SYNC_SETTINGS: CalendarSyncSettings = {
  autoSync: false,
  syncMode: 'api',
};

// In-memory cache for active GIS client and access token
let activeTokenClient: TokenClient | null = null;
let cachedAccessToken: string | null = null;

/**
 * Checks if the stored Google access token has expired or is nearing expiration
 */
export function isGoogleTokenExpired(): boolean {
  try {
    const expiryRaw = localStorage.getItem(GCAL_EXPIRY_STORAGE_KEY);
    if (!expiryRaw) return true;
    const expiry = parseInt(expiryRaw, 10);
    // Buffer by 60 seconds before expiration
    return Date.now() >= expiry - 60 * 1000;
  } catch {
    return true;
  }
}

/**
 * Retrieves cached Google access token from memory or localStorage
 */
export function getCachedGoogleAccessToken(): string | null {
  if (cachedAccessToken && !isGoogleTokenExpired()) return cachedAccessToken;
  try {
    const saved = localStorage.getItem(GCAL_TOKEN_STORAGE_KEY);
    if (saved && !isGoogleTokenExpired()) {
      cachedAccessToken = saved;
      return saved;
    }
  } catch {
    // Storage not accessible
  }
  return null;
}

/**
 * Updates or clears the cached Google access token with expiration timestamp in localStorage
 */
export function setCachedGoogleAccessToken(token: string | null, expiresInSeconds = 3599): void {
  cachedAccessToken = token;
  try {
    if (token) {
      localStorage.setItem(GCAL_TOKEN_STORAGE_KEY, token);
      const expiry = Date.now() + expiresInSeconds * 1000;
      localStorage.setItem(GCAL_EXPIRY_STORAGE_KEY, expiry.toString());
    } else {
      localStorage.removeItem(GCAL_TOKEN_STORAGE_KEY);
      localStorage.removeItem(GCAL_EXPIRY_STORAGE_KEY);
    }
  } catch {
    // Storage write error ignored
  }
}

/**
 * Checks if active Google Calendar connection exists or is configured for silent sync
 */
export function isGoogleCalendarConnected(): boolean {
  if (getCachedGoogleAccessToken()) return true;
  const settings = getCalendarSyncSettings();
  return !!(settings.autoSync && settings.googleClientId);
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
 * Silently refreshes Google OAuth access token using Google Identity Services
 * without showing user prompts if previous authorization exists
 */
export function refreshGoogleAccessTokenSilently(): Promise<string | null> {
  return new Promise((resolve) => {
    const settings = getCalendarSyncSettings();
    if (!settings.googleClientId || !settings.autoSync) {
      resolve(null);
      return;
    }
    if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
      resolve(null);
      return;
    }

    const timer = setTimeout(() => resolve(null), 10000);

    try {
      activeTokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: settings.googleClientId.trim(),
        scope: 'https://www.googleapis.com/auth/calendar.events',
        callback: (response: TokenResponse) => {
          clearTimeout(timer);
          if (response.access_token) {
            const expiresIn = response.expires_in ?? 3599;
            setCachedGoogleAccessToken(response.access_token, expiresIn);
            resolve(response.access_token);
          } else {
            resolve(null);
          }
        },
        error_callback: () => {
          clearTimeout(timer);
          resolve(null);
        },
      });

      activeTokenClient.requestAccessToken({ prompt: '' });
    } catch {
      clearTimeout(timer);
      resolve(null);
    }
  });
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
        const expiresIn = response.expires_in ?? 3599;
        setCachedGoogleAccessToken(response.access_token, expiresIn);
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

  let token = getCachedGoogleAccessToken();
  if (!token) {
    token = await refreshGoogleAccessTokenSilently();
  }

  if (!token) {
    return { synced: false, status: 'not_authenticated' };
  }

  const success = await createGoogleCalendarEventViaApi(task, token);
  return {
    synced: success,
    status: success ? 'synced_silently' : 'failed',
  };
}
