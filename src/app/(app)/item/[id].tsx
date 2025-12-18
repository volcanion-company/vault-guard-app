/**
 * Item Detail Screen (View and decrypt item)
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useVaultItemStore } from '@/store/vault-item.store';
import { useAuthStore } from '@/store/auth.store';
import { Loading } from '@/components/Loading';
import { Button } from '@/components/Button';
import { copyToClipboard } from '@/utils/clipboard';
import { PasswordItemData } from '@/types';

export default function ItemDetailScreen() {
  const router = useRouter();
  const { id: itemId, vaultId } = useLocalSearchParams<{
    id: string;
    vaultId: string;
  }>();
  const { items, decryptedItems, decryptItem, deleteItem } = useVaultItemStore();
  const { encryptionKey } = useAuthStore();

  const [isDecrypting, setIsDecrypting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const item = items.find((i) => i.id === itemId);
  const decryptedItem = decryptedItems.get(itemId!);

  useEffect(() => {
    if (item && !decryptedItem && encryptionKey) {
      handleDecrypt();
    }
  }, [item, encryptionKey]);

  const handleDecrypt = async () => {
    if (!encryptionKey) {
      Alert.alert(
        'Locked',
        'Please unlock the app first',
        [
          {
            text: 'Go to Unlock',
            onPress: () => router.replace('/(auth)/unlock'),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    setIsDecrypting(true);
    try {
      await decryptItem(itemId!, encryptionKey);
    } catch (err) {
      Alert.alert(
        'Decryption Failed',
        'Unable to decrypt this item. This usually means the password used to unlock the app is incorrect.',
        [
          {
            text: 'Re-enter Password',
            onPress: () => router.replace('/(auth)/unlock'),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleCopy = async (value: string, label: string) => {
    await copyToClipboard(value);
    Alert.alert('Copied', `${label} copied to clipboard (will clear in 60s)`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(vaultId!, itemId!);
              router.back();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  if (!item || isDecrypting) {
    return <Loading message="Decrypting..." />;
  }

  if (!decryptedItem) {
    return (
      <View style={styles.container}>
        <Text>Failed to decrypt item</Text>
      </View>
    );
  }

  const passwordData = decryptedItem.data as PasswordItemData;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.icon}>🔑</Text>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.type}>
          {item.type.replace('_', ' ').toUpperCase()}
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Username/Email</Text>
          <View style={styles.fieldValue}>
            <Text style={styles.fieldText}>{passwordData.username}</Text>
            <TouchableOpacity
              onPress={() => handleCopy(passwordData.username, 'Username')}
              style={styles.copyButton}
            >
              <Text style={styles.copyText}>📋</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Password</Text>
          <View style={styles.fieldValue}>
            <Text style={styles.fieldText}>
              {showPassword ? passwordData.password : '••••••••••••'}
            </Text>
            <View style={styles.fieldActions}>
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>
                  {showPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleCopy(passwordData.password, 'Password')}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>📋</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {passwordData.url && (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Website</Text>
            <View style={styles.fieldValue}>
              <Text style={styles.fieldText}>{passwordData.url}</Text>
              <TouchableOpacity
                onPress={() => handleCopy(passwordData.url!, 'URL')}
                style={styles.copyButton}
              >
                <Text style={styles.copyText}>📋</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {passwordData.notes && (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Notes</Text>
            <Text style={styles.notesText}>{passwordData.notes}</Text>
          </View>
        )}
      </View>

      <View style={styles.metadata}>
        <Text style={styles.metaText}>
          Created: {new Date(item.createdAt).toLocaleString()}
        </Text>
        <Text style={styles.metaText}>
          Updated: {new Date(item.updatedAt).toLocaleString()}
        </Text>
        {item.lastAccessedAt && (
          <Text style={styles.metaText}>
            Last accessed: {new Date(item.lastAccessedAt).toLocaleString()}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <Button
          title="Delete Item"
          onPress={handleDelete}
          variant="danger"
        />
      </View>
    </ScrollView>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  type: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  fieldValue: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  fieldText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  fieldActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  actionText: {
    fontSize: 20,
  },
  copyButton: {
    padding: 4,
  },
  copyText: {
    fontSize: 20,
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  metadata: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  actions: {
    marginBottom: 24,
  },
});
