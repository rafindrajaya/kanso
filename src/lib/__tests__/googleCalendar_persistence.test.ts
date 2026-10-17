import test from 'node:test';
import assert from 'node:assert/strict';
import {
  setCachedGoogleAccessToken,
  getCachedGoogleAccessToken,
  isGoogleTokenExpired,
  isGoogleCalendarConnected,
  disconnectGoogleCalendar,
  saveCalendarSyncSettings,
} from '../googleCalendar';

// Mock localStorage for test environment
const mockStorage = new Map<string, string>();
if (typeof globalThis.localStorage === 'undefined') {
  // @ts-expect-error Mocking minimal localStorage interface for tests
  globalThis.localStorage = {
    getItem: (key: string) => mockStorage.get(key) ?? null,
    setItem: (key: string, val: string) => { mockStorage.set(key, String(val)); },
    removeItem: (key: string) => { mockStorage.delete(key); },
    clear: () => { mockStorage.clear(); },
  };
}

test('setCachedGoogleAccessToken stores token and future expiry in localStorage', () => {
  mockStorage.clear();
  setCachedGoogleAccessToken('ya29.test-token-123', 3600);

  assert.strictEqual(mockStorage.get('kanso_gcal_token'), 'ya29.test-token-123');
  const expiryRaw = mockStorage.get('kanso_gcal_token_expires_at');
  assert.ok(expiryRaw, 'Expiry timestamp must be recorded');
  const expiry = parseInt(expiryRaw, 10);
  assert.ok(expiry > Date.now() + 3500 * 1000);

  // Cached retrieval
  assert.strictEqual(getCachedGoogleAccessToken(), 'ya29.test-token-123');
  assert.strictEqual(isGoogleTokenExpired(), false);
});

test('isGoogleTokenExpired returns true when token is expired or within 60s buffer', () => {
  mockStorage.clear();
  // Set token expired 1 second ago
  setCachedGoogleAccessToken('expired-token', -10);
  assert.strictEqual(isGoogleTokenExpired(), true);
  assert.strictEqual(getCachedGoogleAccessToken(), null);
});

test('disconnectGoogleCalendar completely removes token and expiry from localStorage', () => {
  mockStorage.clear();
  setCachedGoogleAccessToken('valid-token', 3600);
  saveCalendarSyncSettings({ autoSync: true, syncMode: 'api', googleClientId: 'test-client-id' });

  disconnectGoogleCalendar();

  assert.strictEqual(mockStorage.get('kanso_gcal_token'), undefined);
  assert.strictEqual(mockStorage.get('kanso_gcal_token_expires_at'), undefined);
  assert.strictEqual(getCachedGoogleAccessToken(), null);
});

test('isGoogleCalendarConnected returns true if valid token or configured silent sync', () => {
  mockStorage.clear();
  assert.strictEqual(isGoogleCalendarConnected(), false);

  // With configured silent sync
  saveCalendarSyncSettings({ autoSync: true, syncMode: 'api', googleClientId: 'my-client.apps.googleusercontent.com' });
  assert.strictEqual(isGoogleCalendarConnected(), true);

  // With active token
  saveCalendarSyncSettings({ autoSync: false, syncMode: 'api' });
  setCachedGoogleAccessToken('valid-token', 3600);
  assert.strictEqual(isGoogleCalendarConnected(), true);
});
