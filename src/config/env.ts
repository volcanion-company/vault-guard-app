/**
 * Environment Configuration
 * 
 * Centralized configuration for API endpoints and app settings
 * 
 * For production, consider using:
 * - expo-constants for environment variables
 * - .env files with react-native-dotenv
 */

const ENV = {
  // API Endpoints
  AUTH_BASE_URL: 'https://auth.volcanion.vn',
  API_BASE_URL: 'https://api.vaultguard.volcanion.vn',

  // Development URLs (uncomment for local development)
  // AUTH_BASE_URL: 'http://localhost:5000',
  // API_BASE_URL: 'http://localhost:5001',

  // Security Settings
  PBKDF2_ITERATIONS: 100000,
  AES_KEY_LENGTH: 256,
  CLIPBOARD_CLEAR_TIMEOUT_MS: 60000, // 60 seconds

  // App Settings
  APP_NAME: 'VaultGuard',
  APP_VERSION: '1.0.0',

  // Storage Keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'vaultguard_access_token',
    REFRESH_TOKEN: 'vaultguard_refresh_token',
    DEVICE_ID: 'vaultguard_device_id',
    BIOMETRIC_ENABLED: 'vaultguard_biometric_enabled',
  },
};

export default ENV;
