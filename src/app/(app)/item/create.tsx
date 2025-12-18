/**
 * Create Vault Item Screen
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
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useVaultItemStore } from '@/store/vault-item.store';
import { useAuthStore } from '@/store/auth.store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ErrorMessage } from '@/components/ErrorMessage';
import { VaultItemType, PasswordItemData } from '@/types';

type ItemType = 'password' | 'note' | 'card';

export default function CreateItemScreen() {
  const router = useRouter();
  const { vaultId } = useLocalSearchParams<{ vaultId: string }>();
  const { createItem, isLoading, error, clearError } = useVaultItemStore();
  const { encryptionKey } = useAuthStore();

  const [selectedType, setSelectedType] = useState<ItemType>('password');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    url: '',
    notes: '',
  });

  const handleCreateItem = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name for this item');
      return;
    }

    if (selectedType === 'password' && !formData.password) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (!encryptionKey) {
      Alert.alert('Error', 'Encryption key not available. Please unlock the app.');
      return;
    }

    clearError();

    try {
      let itemData: PasswordItemData;
      let itemType: VaultItemType;

      if (selectedType === 'password') {
        itemData = {
          username: formData.username,
          password: formData.password,
          url: formData.url || undefined,
          notes: formData.notes || undefined,
        };
        itemType = VaultItemType.PASSWORD;
      } else {
        // For now, only password type is implemented
        Alert.alert('Info', 'Only password items are supported in this version');
        return;
      }

      await createItem(
        vaultId!,
        itemType,
        formData.name.trim(),
        itemData,
        encryptionKey
      );

      Alert.alert('Success', 'Item created successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      // Error displayed via ErrorMessage component
    }
  };

  const generatePassword = () => {
    const length = 16;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    // Use cryptographically secure random number generator
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(randomValues[i] % charset.length);
    }
    setFormData((prev) => ({ ...prev, password }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {error && <ErrorMessage message={error} onDismiss={clearError} />}

        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              selectedType === 'password' && styles.typeButtonActive,
            ]}
            onPress={() => setSelectedType('password')}
          >
            <Text
              style={[
                styles.typeButtonText,
                selectedType === 'password' && styles.typeButtonTextActive,
              ]}
            >
              🔑 Password
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.typeButton, styles.typeButtonDisabled]}
            disabled
          >
            <Text style={[styles.typeButtonText, styles.typeButtonTextDisabled]}>
              📝 Note (Soon)
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.typeButton, styles.typeButtonDisabled]}
            disabled
          >
            <Text style={[styles.typeButtonText, styles.typeButtonTextDisabled]}>
              💳 Card (Soon)
            </Text>
          </TouchableOpacity>
        </View>

        {selectedType === 'password' && (
          <>
            <Input
              label="Name"
              placeholder="e.g., Gmail Account"
              value={formData.name}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, name: value }))
              }
            />

            <Input
              label="Username/Email"
              placeholder="your.email@example.com"
              value={formData.username}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, username: value }))
              }
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View>
              <Input
                label="Password"
                placeholder="Enter password"
                value={formData.password}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, password: value }))
                }
                isPassword
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.generateButton}
                onPress={generatePassword}
              >
                <Text style={styles.generateButtonText}>🎲 Generate</Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Website URL (Optional)"
              placeholder="https://example.com"
              value={formData.url}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, url: value }))
              }
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <Input
              label="Notes (Optional)"
              placeholder="Additional information..."
              value={formData.notes}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, notes: value }))
              }
              multiline
              numberOfLines={3}
              style={styles.notesInput}
            />
          </>
        )}

        <View style={styles.actions}>
          <Button
            title="Save Item"
            onPress={handleCreateItem}
            loading={isLoading}
          />
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="secondary"
            style={styles.cancelButton}
          />
        </View>

        <View style={styles.securityNote}>
          <Text style={styles.securityIcon}>🔐</Text>
          <Text style={styles.securityText}>
            This data will be encrypted on your device before being sent to the server.
          </Text>
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
  content: {
    padding: 24,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  typeButtonDisabled: {
    opacity: 0.5,
  },
  typeButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  typeButtonTextDisabled: {
    color: '#9CA3AF',
  },
  generateButton: {
    position: 'absolute',
    right: 12,
    top: 36,
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  actions: {
    marginTop: 16,
  },
  cancelButton: {
    marginTop: 8,
  },
  securityNote: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 11,
    color: '#166534',
    lineHeight: 16,
  },
});
