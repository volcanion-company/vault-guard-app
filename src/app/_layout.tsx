/**
 * Root Layout - Expo Router
 * 
 * Handles navigation structure and session management
 */

import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { Loading } from '@/components/Loading';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, encryptionKey, isLoading, loadSession, lockApp } = useAuthStore();

  // Load session on app start
  useEffect(() => {
    loadSession();
  }, []);

  // Clear encryption key when app goes to background for security
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'background' && isAuthenticated && encryptionKey) {
          // Lock app when going to background
          lockApp();
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, encryptionKey, lockApp]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    if (!isAuthenticated && !inAuthGroup) {
      // Not authenticated, redirect to login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && !encryptionKey && !segments.includes('unlock')) {
      // Authenticated but locked, redirect to unlock
      router.replace('/(auth)/unlock');
    } else if (isAuthenticated && encryptionKey && !inAppGroup) {
      // Authenticated and unlocked, redirect to app
      router.replace('/(app)/vaults');
    }
  }, [isAuthenticated, encryptionKey, isLoading, segments]);

  if (isLoading) {
    return <Loading message="Loading..." />;
  }

  return <Slot />;
}
