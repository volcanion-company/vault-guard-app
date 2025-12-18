/**
 * Vaults List Screen
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useVaultStore } from '@/store/vault.store';
import { useAuthStore } from '@/store/auth.store';
import { Loading } from '@/components/Loading';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Button } from '@/components/Button';
import { Vault } from '@/types';

export default function VaultsScreen() {
  const router = useRouter();
  const { vaults, isLoading, error, fetchVaults, deleteVault, setCurrentVault } =
    useVaultStore();
  const { logout } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVaults();
  }, []);

  const loadVaults = async () => {
    try {
      await fetchVaults();
    } catch (err) {
      // Error handled by store
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVaults();
    setRefreshing(false);
  };

  const handleVaultPress = (vault: Vault) => {
    setCurrentVault(vault.id);
    router.push(`/(app)/vault/${vault.id}`);
  };

  const handleDeleteVault = (vault: Vault) => {
    Alert.alert(
      'Delete Vault',
      `Are you sure you want to delete "${vault.name}"? This will delete all items inside.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVault(vault.id);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete vault');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const renderVaultItem = ({ item }: { item: Vault }) => (
    <TouchableOpacity
      style={styles.vaultCard}
      onPress={() => handleVaultPress(item)}
      onLongPress={() => handleDeleteVault(item)}
    >
      <View style={styles.vaultIcon}>
        <Text style={styles.iconText}>{item.icon || '🔒'}</Text>
      </View>
      <View style={styles.vaultInfo}>
        <Text style={styles.vaultName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.vaultDescription}>{item.description}</Text>
        )}
        <Text style={styles.vaultMeta}>
          {item.itemCount} {item.itemCount === 1 ? 'item' : 'items'}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔐</Text>
      <Text style={styles.emptyTitle}>No Vaults Yet</Text>
      <Text style={styles.emptyText}>
        Create your first vault to start storing passwords securely
      </Text>
      <Button
        title="Create Vault"
        onPress={() => router.push('/(app)/vault/create')}
        style={styles.emptyButton}
      />
    </View>
  );

  if (isLoading && vaults.length === 0) {
    return <Loading message="Loading vaults..." />;
  }

  return (
    <View style={styles.container}>
      {error && (
        <ErrorMessage
          message={error}
          onRetry={loadVaults}
        />
      )}

      <FlatList
        data={vaults}
        renderItem={renderVaultItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          vaults.length === 0 && styles.emptyContent,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      <View style={styles.footer}>
        <Button
          title="+ New Vault"
          onPress={() => router.push('/(app)/vault/create')}
        />
        <Button
          title="Settings"
          onPress={() => router.push('/(app)/settings')}
          variant="secondary"
          style={styles.settingsButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    padding: 16,
  },
  emptyContent: {
    flexGrow: 1,
  },
  vaultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  vaultIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 28,
  },
  vaultInfo: {
    flex: 1,
  },
  vaultName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  vaultDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  vaultMeta: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  chevron: {
    fontSize: 24,
    color: '#D1D5DB',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  settingsButton: {
    marginTop: 8,
  },
});
