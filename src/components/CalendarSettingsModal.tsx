import React, { useState } from 'react';
import { CalendarSync, Check, AlertCircle, LogOut, X } from 'lucide-react';
import {
  getCalendarSyncSettings,
  saveCalendarSyncSettings,
  isGoogleCalendarConnected,
  requestGoogleAccessToken,
  disconnectGoogleCalendar,
} from '../lib/googleCalendar';
import { CalendarSyncSettings } from '../types/task';

interface CalendarSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged: (settings: CalendarSyncSettings) => void;
}

export const CalendarSettingsModal: React.FC<CalendarSettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsChanged,
}): React.JSX.Element | null => {
  const [settings, setSettings] = useState<CalendarSyncSettings>(() => getCalendarSyncSettings());
  const [clientId, setClientId] = useState<string>(settings.googleClientId || '');
  const [isConnected, setIsConnected] = useState<boolean>(() => isGoogleCalendarConnected());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = (): void => {
    if (!clientId.trim()) {
      setErrorMessage('Please enter your Google OAuth Client ID.');
      return;
    }
    setErrorMessage(null);
    setStatusMessage('Connecting with Google...');

    requestGoogleAccessToken(
      clientId.trim(),
      () => {
        setIsConnected(true);
        setStatusMessage('Connected! Silent background sync is now ready.');
        const updated: CalendarSyncSettings = {
          ...settings,
          autoSync: true,
          googleClientId: clientId.trim(),
        };
        saveCalendarSyncSettings(updated);
        setSettings(updated);
        onSettingsChanged(updated);
      },
      (err) => {
        setStatusMessage(null);
        setErrorMessage(
          typeof err === 'string'
            ? err
            : 'Google connection failed. Check your Client ID and authorized origins.'
        );
      }
    );
  };

  const handleDisconnect = (): void => {
    disconnectGoogleCalendar();
    setIsConnected(false);
    setStatusMessage(null);
    const updated: CalendarSyncSettings = { ...settings, autoSync: false };
    saveCalendarSyncSettings(updated);
    setSettings(updated);
    onSettingsChanged(updated);
  };

  const handleToggleAutoSync = (): void => {
    const updated: CalendarSyncSettings = { ...settings, autoSync: !settings.autoSync };
    saveCalendarSyncSettings(updated);
    setSettings(updated);
    onSettingsChanged(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-comic-card dark:bg-comic-cardDark border-2 border-comic-ink dark:border-white rounded-2xl comic-shadow-lg p-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-comic-ink/20 dark:border-white/20">
          <div className="flex items-center gap-2">
            <CalendarSync size={20} className="text-comic-green dark:text-emerald-400" />
            <h2 className="text-base font-black text-[#0F0F0F] dark:text-white">
              Google Calendar Silent Sync
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border-2 border-comic-ink dark:border-white flex items-center justify-center text-comic-ink dark:text-white hover:bg-comic-bg dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close settings"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-3.5 text-xs font-mono">
          <p className="text-comic-inkMuted dark:text-neutral-300 leading-relaxed">
            Directly syncs newly created tasks into your Google Calendar in the background—<strong>100% silent with zero new browser tabs or redirects</strong>.
          </p>

          {/* Connection Status Box */}
          <div
            className={`p-3 rounded-xl border-2 flex items-center justify-between ${
              isConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-900 dark:text-emerald-200'
                : 'bg-comic-bg dark:bg-neutral-800 border-comic-ink/30 dark:border-neutral-600 text-comic-ink dark:text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle size={16} className="text-amber-600 dark:text-amber-400" />
              )}
              <span className="font-bold">
                {isConnected ? 'Connected (Silent Sync Active)' : 'Not Connected'}
              </span>
            </div>
            {isConnected && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-2 py-1 rounded-lg border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 flex items-center gap-1 font-bold"
              >
                <LogOut size={12} /> Disconnect
              </button>
            )}
          </div>

          {/* Client ID Configuration when not connected */}
          {!isConnected && (
            <div className="space-y-2">
              <label className="block font-bold text-comic-ink dark:text-neutral-200">
                Google Cloud OAuth Client ID:
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="your-client-id.apps.googleusercontent.com"
                className="w-full p-2.5 rounded-xl border-2 border-comic-ink/30 dark:border-neutral-600 bg-comic-bg dark:bg-neutral-800 text-comic-ink dark:text-white outline-none focus:border-comic-ink dark:focus:border-white font-mono text-xs"
              />
              <button
                type="button"
                onClick={handleConnect}
                className="w-full py-2.5 rounded-xl border-2 border-comic-ink dark:border-white bg-[#0F0F0F] text-white dark:bg-white dark:text-[#0F0F0F] font-black comic-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
              >
                Connect Google Calendar
              </button>
            </div>
          )}

          {/* Messages */}
          {statusMessage && (
            <p className="text-emerald-600 dark:text-emerald-400 font-bold">{statusMessage}</p>
          )}
          {errorMessage && (
            <p className="text-red-600 dark:text-red-400 font-bold">{errorMessage}</p>
          )}

          {/* Auto-Sync Enable Toggle */}
          <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.autoSync}
              onChange={handleToggleAutoSync}
              className="w-4 h-4 rounded accent-comic-green cursor-pointer"
            />
            <span className="font-bold text-comic-ink dark:text-neutral-200">
              Automatically sync tasks upon creation
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t-2 border-dashed border-comic-ink/20 dark:border-white/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border-2 border-comic-ink dark:border-white bg-comic-card dark:bg-comic-cardDark font-bold hover:bg-comic-bg dark:hover:bg-neutral-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
