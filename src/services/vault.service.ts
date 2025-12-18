/**
 * Vault Service
 * 
 * Handles vault management operations:
 * - List vaults
 * - Create vault
 * - Update vault
 * - Delete vault
 * - Get vault by ID
 */

import { apiClient, handleApiError } from './api';
import {
  Vault,
  CreateVaultRequest,
  UpdateVaultRequest,
  PaginatedResponse,
} from '@/types';

export class VaultService {
  /**
   * Get all vaults for authenticated user
   */
  static async getVaults(): Promise<Vault[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<Vault>>(
        '/api/vaults'
      );
      return response.data.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }

  /**
   * Get vault by ID
   */
  static async getVaultById(vaultId: string): Promise<Vault> {
    try {
      const response = await apiClient.get<Vault>(`/api/vaults/${vaultId}`);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }

  /**
   * Create new vault
   */
  static async createVault(request: CreateVaultRequest): Promise<Vault> {
    try {
      const response = await apiClient.post<Vault>('/api/vaults', request);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }

  /**
   * Update vault
   */
  static async updateVault(
    vaultId: string,
    request: UpdateVaultRequest
  ): Promise<Vault> {
    try {
      const response = await apiClient.put<Vault>(
        `/api/vaults/${vaultId}`,
        request
      );
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }

  /**
   * Delete vault (soft delete)
   */
  static async deleteVault(vaultId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/vaults/${vaultId}`);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }
}
