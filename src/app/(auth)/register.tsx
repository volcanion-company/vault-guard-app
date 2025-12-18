/**
 * Register Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ErrorMessage } from '@/components/ErrorMessage';
import { isValidEmail, isStrongPassword, getPasswordStrength } from '@/utils/validation';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const passwordStrength = getPasswordStrength(formData.password);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isStrongPassword(formData.password)) {
      newErrors.password =
        'Password must be at least 8 characters with uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    if (!formData.firstName || !formData.lastName) {
      Alert.alert('Error', 'Please enter your first and last name');
      return;
    }

    clearError();

    try {
      await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );
      // Navigation handled by _layout.tsx
    } catch (err) {
      // Error displayed via ErrorMessage component
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>🔐</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join VaultGuard - Secure Password Manager
          </Text>
        </View>

        <View style={styles.form}>
          {error && (
            <ErrorMessage message={error} onDismiss={clearError} />
          )}

          <Input
            label="First Name"
            placeholder="John"
            value={formData.firstName}
            onChangeText={(value) => updateField('firstName', value)}
            autoCapitalize="words"
          />

          <Input
            label="Last Name"
            placeholder="Doe"
            value={formData.lastName}
            onChangeText={(value) => updateField('lastName', value)}
            autoCapitalize="words"
          />

          <Input
            label="Email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Master Password"
            placeholder="Create a strong password"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            error={errors.password}
            isPassword
            autoCapitalize="none"
            autoCorrect={false}
          />

          {formData.password.length > 0 && (
            <View style={styles.passwordStrength}>
              <View
                style={[
                  styles.strengthBar,
                  styles[`strength_${passwordStrength.strength}`],
                ]}
              />
              <Text style={styles.strengthText}>
                Strength: {passwordStrength.label}
              </Text>
            </View>
          )}

          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            error={errors.confirmPassword}
            isPassword
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            style={styles.registerButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
            </Text>
            <Button
              title="Sign In"
              onPress={() => router.push('/(auth)/login')}
              variant="secondary"
            />
          </View>

          <View style={styles.securityNote}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>
              <Text style={styles.bold}>Zero-Knowledge Security:</Text> Your
              master password encrypts all your data on your device. We never
              see or store your password or encryption key.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  passwordStrength: {
    marginBottom: 16,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  strength_weak: {
    width: '33%',
    backgroundColor: '#EF4444',
  },
  strength_medium: {
    width: '66%',
    backgroundColor: '#F59E0B',
  },
  strength_strong: {
    width: '100%',
    backgroundColor: '#10B981',
  },
  strengthText: {
    fontSize: 12,
    color: '#6B7280',
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  footer: {
    alignItems: 'center',
    gap: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  securityNote: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'flex-start',
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: '#166534',
    lineHeight: 18,
  },
  bold: {
    fontWeight: '600',
  },
});
