/**
 * Clipboard Utilities
 * 
 * Handles secure clipboard operations:
 * - Copy to clipboard
 * - Auto-clear after timeout (security feature)
 * - Cleanup support for preventing memory leaks
 */

import * as Clipboard from 'expo-clipboard';

const CLIPBOARD_CLEAR_TIMEOUT = 60000; // 60 seconds

// Track active clipboard timers for cleanup
const activeTimers = new Set<NodeJS.Timeout>();

/**
 * Copy text to clipboard with auto-clear
 * @param text - Text to copy
 * @param autoClear - Whether to auto-clear after timeout (default: true)
 * @returns Cleanup function to cancel the auto-clear timer
 */
export async function copyToClipboard(
  text: string,
  autoClear: boolean = true
): Promise<() => void> {
  await Clipboard.setStringAsync(text);

  if (autoClear) {
    // Clear clipboard after timeout for security
    const timer = setTimeout(async () => {
      const current = await Clipboard.getStringAsync();
      // Only clear if clipboard still contains the same value
      if (current === text) {
        await Clipboard.setStringAsync('');
      }
      activeTimers.delete(timer);
    }, CLIPBOARD_CLEAR_TIMEOUT);
    
    activeTimers.add(timer);
    
    // Return cleanup function
    return () => {
      clearTimeout(timer);
      activeTimers.delete(timer);
    };
  }
  
  return () => {}; // No-op cleanup if autoClear is false
}

/**
 * Get text from clipboard
 */
export async function getFromClipboard(): Promise<string> {
  return await Clipboard.getStringAsync();
}

/**
 * Clear clipboard
 */
export async function clearClipboard(): Promise<void> {
  await Clipboard.setStringAsync('');
}

/**
 * Clear all active clipboard timers (call on app unmount/logout)
 */
export function clearAllClipboardTimers(): void {
  activeTimers.forEach(timer => clearTimeout(timer));
  activeTimers.clear();
}
