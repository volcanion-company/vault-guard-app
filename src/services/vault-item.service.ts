/**
 * Vault Item Service
 * 
 * Handles vault item operations:
 * - List items in vault
 * - Create item (with client-side encryption)
 * - Update item
 * - Delete item
 * - Get item by ID
 * 
 * SECURITY: All sensitive data is encrypted client-side before sending to server
 */

import { apiClient, handleApiError } from './api';
import {
  VaultItem,
  CreateVaultItemRequest,
  UpdateVaultItemRequest,
  VaultItemType,
  VaultItemData,
  DecryptedVaultItem,
  PaginatedResponse,
} from '@/types';
import { encryptObject, decryptObject, EncryptedData } from '@/crypto';

export class VaultItemService {
  /**
   * Get all items in a vault
   */
  static async getVaultItems(vaultId: string): Promise<VaultItem[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<VaultItem>>(
        `/api/vaults/${vaultId}/items`
      );
      return response.data.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }

  /**
   * Get item by ID
   */
  static async getVaultItemById(
    vaultId: string,
    itemId: string
  ): Promise<VaultItem> {
    try {
      const response = await apiClient.get<VaultItem>(
        `/api/vaults/${vaultId}/items/${itemId}`
      );
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }

  /**
   * Create new vault item (encrypts data client-side)
   */
  static async createVaultItem(
    vaultId: string,
    type: VaultItemType,
    name: string,
    data: VaultItemData,
    encryptionKey: string,
    favorite: boolean = false
  ): Promise<VaultItem> {
    try {
      // Encrypt sensitive data client-side
      const encryptedData = await encryptObject(data, encryptionKey);

      const request: CreateVaultItemRequest = {
        vaultId,
        type,
        name,
        encryptedData,
        favorite,
      };

      const response = await apiClient.post<VaultItem>(
        `/api/vaults/${vaultId}/items`,
        request
      );
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }

  /**
   * Update vault item
   */
  static async updateVaultItem(
    vaultId: string,
    itemId: string,
    request: UpdateVaultItemRequest
  ): Promise<VaultItem> {
    try {
      const response = await apiClient.put<VaultItem>(
        `/api/vaults/${vaultId}/items/${itemId}`,
        request
      );
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }

  /**
   * Update vault item with encrypted data
   */
  static async updateVaultItemData(
    vaultId: string,
    itemId: string,
    name: string,
    data: VaultItemData,
    encryptionKey: string,
    favorite?: boolean
  ): Promise<VaultItem> {
    try {
      // Encrypt new data client-side
      const encryptedData = await encryptObject(data, encryptionKey);

      const request: UpdateVaultItemRequest = {
        name,
        encryptedData,
        favorite,
      };

      return await this.updateVaultItem(vaultId, itemId, request);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }

  /**
   * Delete vault item
   */
  static async deleteVaultItem(
    vaultId: string,
    itemId: string
  ): Promise<void> {
    try {
      await apiClient.delete(`/api/vaults/${vaultId}/items/${itemId}`);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }

  /**
   * Decrypt vault item (client-side only)
   */
  static async decryptVaultItem(
    item: VaultItem,
    encryptionKey: string
  ): Promise<DecryptedVaultItem> {
    try {
      const decryptedData = await decryptObject<VaultItemData>(
        item.encryptedData,
        encryptionKey
      );

      return {
        ...item,
        data: decryptedData,
      };
    } catch (error) {
      console.error('Failed to decrypt vault item:', error);
      throw new Error('Failed to decrypt item - incorrect password');
    }
  }

  /**
   * Toggle favorite status
   */
  static async toggleFavorite(
    vaultId: string,
    itemId: string,
    currentStatus: boolean
  ): Promise<VaultItem> {
    return await this.updateVaultItem(vaultId, itemId, {
      favorite: !currentStatus,
    });
  }
}
