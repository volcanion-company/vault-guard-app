/**
 * Clipboard Utilities
 * 
 * Handles secure clipboard operations:
 * - Copy to clipboard
 * - Auto-clear after timeout (security feature)
 */

import * as Clipboard from 'expo-clipboard';

const CLIPBOARD_CLEAR_TIMEOUT = 60000; // 60 seconds

/**
 * Copy text to clipboard with auto-clear
 * @param text - Text to copy
 * @param autoClear - Whether to auto-clear after timeout (default: true)
 */
export async function copyToClipboard(
  text: string,
  autoClear: boolean = true
): Promise<void> {
  await Clipboard.setStringAsync(text);

  if (autoClear) {
    // Clear clipboard after timeout for security
    setTimeout(async () => {
      const current = await Clipboard.getStringAsync();
      // Only clear if clipboard still contains the same value
      if (current === text) {
        await Clipboard.setStringAsync('');
      }
    }, CLIPBOARD_CLEAR_TIMEOUT);
  }
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
