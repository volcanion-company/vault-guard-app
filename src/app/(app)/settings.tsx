/**
 * Settings Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/Button';
import { getDeviceInfo } from '@/utils/device';

const BIOMETRIC_ENABLED_KEY = 'vaultguard_biometric_enabled';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    checkBiometricAvailability();
    loadBiometricSetting();
    loadDeviceInfo();
  }, []);

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const available = compatible && enrolled;

    setBiometricAvailable(available);

    if (available) {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('Face ID');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('Fingerprint');
      } else {
        setBiometricType('Biometric');
      }
    }
  };

  const loadBiometricSetting = async () => {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    setBiometricEnabled(enabled === 'true');
  };

  const loadDeviceInfo = async () => {
    const info = await getDeviceInfo();
    setDeviceInfo(info);
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      // Test biometric authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric unlock',
        fallbackLabel: 'Use password',
      });

      if (result.success) {
        await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
        setBiometricEnabled(true);
      } else {
        Alert.alert('Failed', 'Biometric authentication failed');
      }
    } else {
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'false');
      setBiometricEnabled(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          
          {user?.firstName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>
                {user.firstName} {user.lastName}
              </Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID</Text>
            <Text style={styles.infoValueSmall}>{user?.id}</Text>
          </View>
        </View>
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        <View style={styles.card}>
          {biometricAvailable && (
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>
                  {biometricType} Unlock
                </Text>
                <Text style={styles.settingDescription}>
                  Use {biometricType.toLowerCase()} to unlock VaultGuard
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={biometricEnabled ? '#3B82F6' : '#F3F4F6'}
              />
            </View>
          )}
          
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Change Master Password</Text>
              <Text style={styles.settingDescription}>
                Update your encryption password
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Device Section */}
      {deviceInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Information</Text>
          
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Device Name</Text>
              <Text style={styles.infoValue}>{deviceInfo.deviceName}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Platform</Text>
              <Text style={styles.infoValue}>{deviceInfo.platform}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Device ID</Text>
              <Text style={styles.infoValueSmall}>{deviceInfo.deviceId}</Text>
            </View>
          </View>
        </View>
      )}

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Encryption</Text>
            <Text style={styles.infoValue}>AES-256-GCM</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Key Derivation</Text>
            <Text style={styles.infoValue}>PBKDF2-SHA256</Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.actions}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
        />
      </View>

      {/* Security Notice */}
      <View style={styles.securityNote}>
        <Text style={styles.securityIcon}>🔒</Text>
        <Text style={styles.securityText}>
          VaultGuard uses zero-knowledge encryption. Your master password and
          encryption keys are never sent to our servers.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
  },
  infoValueSmall: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  chevron: {
    fontSize: 24,
    color: '#D1D5DB',
  },
  actions: {
    marginBottom: 24,
  },
  securityNote: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: '#166534',
    lineHeight: 20,
  },
});
