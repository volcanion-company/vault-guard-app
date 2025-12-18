/**
 * Device Utilities
 * 
 * Manages device ID for API requests
 * Device ID is required by backend for audit logging
 */

import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import uuid from 'react-native-uuid';

const DEVICE_ID_KEY = 'vaultguard_device_id';

/**
 * Get or generate device ID
 * Device ID is persisted in SecureStore
 */
export async function getDeviceId(): Promise<string> {
  try {
    // Try to get existing device ID
    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);

    if (!deviceId) {
      // Generate new device ID
      deviceId = uuid.v4() as string;
      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error('Failed to get/generate device ID:', error);
    // Fallback to generating UUID without persistence
    return uuid.v4() as string;
  }
}

/**
 * Get device information
 */
export async function getDeviceInfo() {
  return {
    deviceId: await getDeviceId(),
    deviceName: Device.deviceName || 'Unknown',
    platform: Device.osName || 'Unknown',
    osVersion: Device.osVersion || 'Unknown',
    modelName: Device.modelName || 'Unknown',
  };
}
