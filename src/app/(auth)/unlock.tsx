/**
 * Unlock Screen
 * 
 * When app is locked (encryption key cleared but session active),
 * user must re-enter master password to derive encryption key
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuthStore } from '@/store/auth.store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ErrorMessage } from '@/components/ErrorMessage';

export default function UnlockScreen() {
  const { user, unlockApp, logout, isLoading, error, clearError } = useAuthStore();
  const [password, setPassword] = useState('');

  const handleUnlock = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter your master password');
      return;
    }

    clearError();

    try {
      await unlockApp(password);
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
