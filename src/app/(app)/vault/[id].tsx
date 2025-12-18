/**
 * Vault Items Screen (List items in a vault)
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useVaultItemStore } from '@/store/vault-item.store';
import { useAuthStore } from '@/store/auth.store';
import { Loading } from '@/components/Loading';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Button } from '@/components/Button';
import { VaultItem } from '@/types';

export default function VaultItemsScreen() {
  const router = useRouter();
  const { id: vaultId } = useLocalSearchParams<{ id: string }>();
  const { items, isLoading, error, fetchItems, deleteItem, toggleFavorite } =
    useVaultItemStore();
  const { encryptionKey } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (vaultId) {
      loadItems();
    }
  }, [vaultId]);

  const loadItems = async () => {
    try {
      await fetchItems(vaultId!);
    } catch (err) {
      // Error handled by store
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const handleItemPress = (item: VaultItem) => {
    router.push(`/(app)/item/${item.id}?vaultId=${vaultId}`);
  };

  const handleDeleteItem = (item: VaultItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(vaultId!, item.id);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const handleToggleFavorite = async (item: VaultItem) => {
    try {
      await toggleFavorite(vaultId!, item.id, item.favorite);
    } catch (err) {
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'password':
        return '🔑';
      case 'secure_note':
        return '📝';
      case 'credit_card':
        return '💳';
      default:
        return '📄';
    }
  };

  const renderItem = ({ item }: { item: VaultItem }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => handleItemPress(item)}
      onLongPress={() => handleDeleteItem(item)}
    >
      <View style={styles.itemIcon}>
        <Text style={styles.iconText}>{getItemIcon(item.type)}</Text>
      </View>
      
      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.favorite && <Text style={styles.favoriteIcon}>⭐</Text>}
        </View>
        <Text style={styles.itemType}>
          {item.type.replace('_', ' ').toUpperCase()}
        </Text>
        <Text style={styles.itemDate}>
          Updated {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
      </View>
      
      <TouchableOpacity
        onPress={() => handleToggleFavorite(item)}
        style={styles.favoriteButton}
      >
        <Text style={styles.favoriteButtonText}>
          {item.favorite ? '★' : '☆'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={styles.emptyTitle}>No Items Yet</Text>
      <Text style={styles.emptyText}>
        Add your first password, note, or card to this vault
      </Text>
      <Button
        title="Add Item"
        onPress={() => router.push(`/(app)/item/create?vaultId=${vaultId}`)}
        style={styles.emptyButton}
      />
    </View>
  );

  if (isLoading && items.length === 0) {
    return <Loading message="Loading items..." />;
  }

  return (
    <View style={styles.container}>
      {error && <ErrorMessage message={error} onRetry={loadItems} />}

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          items.length === 0 && styles.emptyContent,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      <View style={styles.footer}>
        <Button
          title="+ Add Item"
          onPress={() => router.push(`/(app)/item/create?vaultId=${vaultId}`)}
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
  itemCard: {
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
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 6,
  },
  favoriteIcon: {
    fontSize: 14,
  },
  itemType: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteButtonText: {
    fontSize: 24,
    color: '#F59E0B',
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
});
