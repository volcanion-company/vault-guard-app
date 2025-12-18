/**
 * Unlock Screen
 * 
 * When app is locked (encryption key cleared but session active),
 * user must re-enter master password to derive encryption key
 * 
 * Supports biometric authentication if enabled in settings
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@/store/auth.store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ErrorMessage } from '@/components/ErrorMessage';
import ENV from '@/config/env';

export default function UnlockScreen() {
  const { user, unlockApp, logout, isLoading, error, clearError } = useAuthStore();
  const [password, setPassword] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const available = compatible && enrolled;
    setBiometricAvailable(available);

    if (available) {
      const enabled = await SecureStore.getItemAsync(
        ENV.STORAGE_KEYS.BIOMETRIC_ENABLED
      );
      setBiometricEnabled(enabled === 'true');

      // Auto-prompt biometric if enabled
      if (enabled === 'true') {
        handleBiometricUnlock();
      }
    }
  };

  const handleBiometricUnlock = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock VaultGuard',
        fallbackLabel: 'Use password',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Get stored master password from secure store
        // Note: This is encrypted and only accessible after biometric auth
        const storedPassword = await SecureStore.getItemAsync(
          'vaultguard_biometric_password'
        );

        if (storedPassword) {
          setPassword(storedPassword);
          await unlockApp(storedPassword);
        } else {
          Alert.alert(
            'Setup Required',
            'Please unlock with your password once to enable biometric unlock.'
          );
        }
      }
    } catch (err) {
      console.error('Biometric authentication failed:', err);
    }
  };

  const handleUnlock = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter your master password');
      return;
    }

    clearError();

    try {
      await unlockApp(password);
      
      // Save password for biometric unlock if enabled
      if (biometricEnabled) {
        await SecureStore.setItemAsync(
          'vaultguard_biometric_password',
          password
        );
      }
      
      // Navigation handled by _layout.tsx
    } catch (err) {
      // Error displayed via ErrorMessage component
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You will need to sign in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.title}>VaultGuard is Locked</Text>
          <Text style={styles.subtitle}>
            Welcome back, {user?.firstName || user?.email}
          </Text>
          <Text style={styles.description}>
            Enter your master password to unlock
          </Text>
        </View>

        <View style={styles.form}>
          {error && (
            <ErrorMessage message={error} onDismiss={clearError} />
          )}

          {biometricAvailable && biometricEnabled && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricUnlock}
            >
              <Text style={styles.biometricIcon}>👆</Text>
              <Text style={styles.biometricText}>Use Biometric</Text>
            </TouchableOpacity>
          )}

          <Input
            label="Master Password"
            placeholder="Enter your master password"
            value={password}
            onChangeText={setPassword}
            isPassword
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleUnlock}
          />

          <Button
            title="Unlock"
            onPress={handleUnlock}
            loading={isLoading}
            style={styles.unlockButton}
          />

          <Button
            title="Logout"
            onPress={handleLogout}
            variant="secondary"
          />
        </View>

        <View style={styles.securityNote}>
          <Text style={styles.securityIcon}>🔐</Text>
          <Text style={styles.securityText}>
            Your vault is encrypted with your master password. We cannot
            recover it if you forget it.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  lockIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  form: {
    width: '100%',
  },
  biometricButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  biometricIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  biometricText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  unlockButton: {
    marginBottom: 12,
  },
  securityNote: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
    alignItems: 'center',
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
});
