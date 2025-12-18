/**
 * Vault Item Store (Zustand)
 * 
 * Manages vault items state:
 * - List of encrypted items
 * - Decrypted items cache (for display)
 * - CRUD operations with client-side encryption
 */

import { create } from 'zustand';
import { VaultItemService } from '@/services/vault-item.service';
import {
  VaultItem,
  DecryptedVaultItem,
  VaultItemType,
  VaultItemData,
} from '@/types';

interface VaultItemStore {
  // State
  items: VaultItem[];
  decryptedItems: Map<string, DecryptedVaultItem>;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchItems: (vaultId: string) => Promise<void>;
  createItem: (
    vaultId: string,
    type: VaultItemType,
    name: string,
    data: VaultItemData,
    encryptionKey: string,
    favorite?: boolean
  ) => Promise<VaultItem>;
  updateItem: (
    vaultId: string,
    itemId: string,
    name: string,
    data: VaultItemData,
    encryptionKey: string,
    favorite?: boolean
  ) => Promise<void>;
  deleteItem: (vaultId: string, itemId: string) => Promise<void>;
  decryptItem: (itemId: string, encryptionKey: string) => Promise<void>;
  toggleFavorite: (
    vaultId: string,
    itemId: string,
    currentStatus: boolean
  ) => Promise<void>;
  clearDecryptedItems: () => void;
  clearError: () => void;
}

export const useVaultItemStore = create<VaultItemStore>((set, get) => ({
  // Initial state
  items: [],
  decryptedItems: new Map(),
  isLoading: false,
  error: null,

  // Fetch items for a vault
  fetchItems: async (vaultId: string) => {
    set({ isLoading: true, error: null });

    try {
      const items = await VaultItemService.getVaultItems(vaultId);
      set({ items, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch items',
        isLoading: false,
      });
      throw error;
    }
  },

  // Create new item (with encryption)
  createItem: async (
    vaultId: string,
    type: VaultItemType,
    name: string,
    data: VaultItemData,
    encryptionKey: string,
    favorite: boolean = false
  ) => {
    set({ isLoading: true, error: null });

    try {
      const newItem = await VaultItemService.createVaultItem(
        vaultId,
        type,
        name,
        data,
        encryptionKey,
        favorite
      );

      set((state) => ({
        items: [...state.items, newItem],
        isLoading: false,
      }));

      return newItem;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create item',
        isLoading: false,
      });
      throw error;
    }
  },

  // Update item
  updateItem: async (
    vaultId: string,
    itemId: string,
    name: string,
    data: VaultItemData,
    encryptionKey: string,
    favorite?: boolean
  ) => {
    set({ isLoading: true, error: null });

    try {
      const updatedItem = await VaultItemService.updateVaultItemData(
        vaultId,
        itemId,
        name,
        data,
        encryptionKey,
        favorite
      );

      set((state) => {
        // Update encrypted item
        const newItems = state.items.map((item) =>
          item.id === itemId ? updatedItem : item
        );

        // Clear decrypted cache for this item
        const newDecryptedItems = new Map(state.decryptedItems);
        newDecryptedItems.delete(itemId);

        return {
          items: newItems,
          decryptedItems: newDecryptedItems,
          isLoading: false,
        };
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update item',
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete item
  deleteItem: async (vaultId: string, itemId: string) => {
    set({ isLoading: true, error: null });

    try {
      await VaultItemService.deleteVaultItem(vaultId, itemId);

      set((state) => {
        const newDecryptedItems = new Map(state.decryptedItems);
        newDecryptedItems.delete(itemId);

        return {
          items: state.items.filter((item) => item.id !== itemId),
          decryptedItems: newDecryptedItems,
          isLoading: false,
        };
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete item',
        isLoading: false,
      });
      throw error;
    }
  },

  // Decrypt item and cache result
  decryptItem: async (itemId: string, encryptionKey: string) => {
    const { items } = get();
    const item = items.find((i) => i.id === itemId);

    if (!item) {
      throw new Error('Item not found');
    }

    try {
      const decryptedItem = await VaultItemService.decryptVaultItem(
        item,
        encryptionKey
      );

      set((state) => {
        const newDecryptedItems = new Map(state.decryptedItems);
        newDecryptedItems.set(itemId, decryptedItem);

        return { decryptedItems: newDecryptedItems };
      });
    } catch (error: any) {
      console.error('Failed to decrypt item:', error);
      throw error;
    }
  },

  // Toggle favorite
  toggleFavorite: async (
    vaultId: string,
    itemId: string,
    currentStatus: boolean
  ) => {
    try {
      const updatedItem = await VaultItemService.toggleFavorite(
        vaultId,
        itemId,
        currentStatus
      );

      set((state) => ({
        items: state.items.map((item) =>
          item.id === itemId ? updatedItem : item
        ),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to toggle favorite' });
      throw error;
    }
  },

  // Clear decrypted items cache
  clearDecryptedItems: () => {
    set({ decryptedItems: new Map() });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
