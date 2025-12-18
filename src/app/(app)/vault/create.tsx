/**
 * Create Vault Screen
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
import { useVaultStore } from '@/store/vault.store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ErrorMessage } from '@/components/ErrorMessage';

const VAULT_ICONS = ['🔒', '🏠', '💼', '🎓', '💳', '🔑', '📱', '🌐'];

export default function CreateVaultScreen() {
  const router = useRouter();
  const { createVault, isLoading, error, clearError } = useVaultStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🔒',
  });

  const handleCreateVault = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a vault name');
      return;
    }

    clearError();

    try {
      await createVault({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        icon: formData.icon,
      });

      Alert.alert('Success', 'Vault created successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      // Error displayed via ErrorMessage component
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {error && <ErrorMessage message={error} onDismiss={clearError} />}

        <Input
          label="Vault Name"
          placeholder="e.g., Personal Accounts"
          value={formData.name}
          onChangeText={(value) =>
            setFormData((prev) => ({ ...prev, name: value }))
          }
          maxLength={100}
        />

        <Input
          label="Description (Optional)"
          placeholder="What's this vault for?"
          value={formData.description}
          onChangeText={(value) =>
            setFormData((prev) => ({ ...prev, description: value }))
          }
          multiline
          numberOfLines={3}
          style={styles.descriptionInput}
        />

        <Text style={styles.iconLabel}>Choose Icon</Text>
        <View style={styles.iconGrid}>
          {VAULT_ICONS.map((icon) => (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconOption,
                formData.icon === icon && styles.iconSelected,
              ]}
              onPress={() =>
                setFormData((prev) => ({ ...prev, icon }))
              }
            >
              <Text style={styles.iconEmoji}>{icon}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actions}>
          <Button
            title="Create Vault"
            onPress={handleCreateVault}
            loading={isLoading}
          />
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="secondary"
            style={styles.cancelButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Import TouchableOpacity
import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  iconLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  iconOption: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  iconEmoji: {
    fontSize: 28,
  },
  actions: {
    marginTop: 16,
  },
  cancelButton: {
    marginTop: 8,
  },
});
