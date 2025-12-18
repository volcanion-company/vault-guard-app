/**
 * API Client Configuration
 * 
 * Handles HTTP requests with:
 * - JWT authentication
 * - Device ID header
 * - Token refresh on 401
 * - Error handling
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { getDeviceId } from '@/utils/device';
import ENV from '@/config/env';

// API Base URLs from centralized config
const AUTH_BASE_URL = ENV.AUTH_BASE_URL;
const API_BASE_URL = ENV.API_BASE_URL;

// Secure storage keys
const STORAGE_KEYS = ENV.STORAGE_KEYS;

/**
 * Create Axios instance for Authentication Service
 */
export const authClient: AxiosInstance = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Create Axios instance for VaultGuard API
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ===== Request Interceptors =====

/**
 * Add JWT token and Device ID to API requests
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get access token from secure storage
    const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Add Device ID header (required by backend)
    const deviceId = await getDeviceId();
    config.headers['X-Device-Id'] = deviceId;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===== Response Interceptors =====

/**
 * Handle token refresh on 401 Unauthorized
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not already retried, attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(
          STORAGE_KEYS.REFRESH_TOKEN
        );

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint
        const response = await authClient.post('/api/v1/authentication/refresh', {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data;

        // Store new tokens
        await SecureStore.setItemAsync(
          STORAGE_KEYS.ACCESS_TOKEN,
          newAccessToken
        );
        await SecureStore.setItemAsync(
          STORAGE_KEYS.REFRESH_TOKEN,
          newRefreshToken
        );

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - user needs to log in again
        await clearTokens();
        // Navigation to login will be handled by auth store
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ===== Token Management =====

export async function saveTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
}

export async function getRefreshToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
}

// ===== Error Handling =====

export interface ApiErrorResponse {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export function handleApiError(error: unknown): ApiErrorResponse {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;

    if (axiosError.response) {
      // Server responded with error
      return {
        message:
          axiosError.response.data?.title ||
          axiosError.response.data?.message ||
          'An error occurred',
        status: axiosError.response.status,
        errors: axiosError.response.data?.errors,
      };
    } else if (axiosError.request) {
      // Request made but no response
      return {
        message: 'Network error - please check your connection',
        status: 0,
      };
    }
  }

  // Unknown error
  return {
    message: 'An unexpected error occurred',
    status: 500,
  };
}
