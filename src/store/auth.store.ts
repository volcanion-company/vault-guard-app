/**
 * Authentication Store (Zustand)
 * 
 * Manages authentication state:
 * - User info
 * - JWT tokens
 * - Encryption key (IN MEMORY ONLY - never persisted)
 * - Login/Logout/Register actions
 * 
 * SECURITY CRITICAL:
 * - Encryption key is ONLY stored in this store (memory)
 * - Cleared on logout or app background
 * - NEVER persisted to disk
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { AuthService } from '@/services/auth.service';
import { deriveEncryptionKey } from '@/crypto';
import { User, LoginRequest, RegisterRequest } from '@/types';
import { saveTokens, clearTokens } from '@/services/api';
import ENV from '@/config/env';

interface AuthStore {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  encryptionKey: string | null; // Base64-encoded key (MEMORY ONLY)
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
  clearError: () => void;
  lockApp: () => void; // Clear encryption key but keep session
  unlockApp: (masterPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  accessToken: null,
  refreshToken: null,
  encryptionKey: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Login action
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const authResponse = await AuthService.login({ email, password });

      // Derive encryption key from master password
      const encryptionKey = await deriveEncryptionKey(
        password,
        authResponse.userId
      );

      // Update state
      set({
        user: {
          id: authResponse.userId,
          email: authResponse.email,
          firstName: authResponse.firstName,
          lastName: authResponse.lastName,
        },
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
        encryptionKey, // Store in memory ONLY
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  // Register action
  register: async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    set({ isLoading: true, error: null });

    try {
      const authResponse = await AuthService.register({
        email,
        password,
        firstName,
        lastName,
      });

      // Derive encryption key from master password
      const encryptionKey = await deriveEncryptionKey(
        password,
        authResponse.userId
      );

      // Persist tokens to SecureStore
      await saveTokens(authResponse.accessToken, authResponse.refreshToken);

      // Update state
      set({
        user: {
          id: authResponse.userId,
          email: authResponse.email,
          firstName: authResponse.firstName,
          lastName: authResponse.lastName,
        },
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
        encryptionKey, // Store in memory ONLY
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  // Logout action
  logout: async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear tokens from SecureStore
      await clearTokens();
      
      // Clear all state
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        encryptionKey: null, // CRITICAL: Clear encryption key
        isAuthenticated: false,
        error: null,
      });
    }
  },

  // Load session from SecureStore (on app start)
  loadSession: async () => {
    set({ isLoading: true });

    try {
      const accessToken = await SecureStore.getItemAsync(
        ENV.STORAGE_KEYS.ACCESS_TOKEN
      );
      const refreshToken = await SecureStore.getItemAsync(
        ENV.STORAGE_KEYS.REFRESH_TOKEN
      );

      if (accessToken && refreshToken) {
        // We have tokens, but NO encryption key
        // User must enter master password to unlock
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      set({ isLoading: false });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Lock app (clear encryption key but keep session)
  lockApp: () => {
    set({ encryptionKey: null });
  },

  // Unlock app (re-derive encryption key from master password)
  unlockApp: async (masterPassword: string) => {
    const { user } = get();

    if (!user) {
      throw new Error('No active session');
    }

    set({ isLoading: true, error: null });

    try {
      // Re-derive encryption key
      const encryptionKey = await deriveEncryptionKey(masterPassword, user.id);

      // Note: Password verification happens when user tries to decrypt their first item
      // If wrong password was entered, decryption will fail and user will see error
      // This is acceptable since we can't verify without attempting decryption
      
      set({
        encryptionKey,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to unlock',
        isLoading: false,
      });
      throw error;
    }
  },
}));
