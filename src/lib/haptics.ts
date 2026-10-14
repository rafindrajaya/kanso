/**
 * Tactile Haptic Feedback utility for mobile devices (iPhone/PWA and Android)
 */

export type HapticStyle = 'light' | 'medium' | 'success';

/**
 * Triggers a subtle tactile vibration if supported by device
 */
export function triggerHaptic(style: HapticStyle = 'light'): void {
  // Check if Web Vibration API is supported in current environment
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (style) {
      case 'light':
        // Crisp 10ms tap for subtle toggles
        navigator.vibrate(10);
        break;
      case 'medium':
        // 20ms tap for drag release
        navigator.vibrate(20);
        break;
      case 'success':
        // Double-tick for task completion
        navigator.vibrate([12, 40, 15]);
        break;
      default:
        navigator.vibrate(10);
    }
  } catch {
    // Silently continue if browser blocks vibration without gesture
  }
}
