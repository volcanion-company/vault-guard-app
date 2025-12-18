/**
 * Vault Store (Zustand)
 * 
 * Manages vault state and operations:
 * - List of vaults
 * - Current selected vault
 * - CRUD operations
 */

import { create } from 'zustand';
import { VaultService } from '@/services/vault.service';
import { Vault, CreateVaultRequest, UpdateVaultRequest } from '@/types';

interface VaultStore {
  // State
  vaults: Vault[];
  currentVaultId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchVaults: () => Promise<void>;
  createVault: (request: CreateVaultRequest) => Promise<Vault>;
  updateVault: (vaultId: string, request: UpdateVaultRequest) => Promise<void>;
  deleteVault: (vaultId: string) => Promise<void>;
  setCurrentVault: (vaultId: string | null) => void;
  clearError: () => void;
}

export const useVaultStore = create<VaultStore>((set, get) => ({
  // Initial state
  vaults: [],
  currentVaultId: null,
  isLoading: false,
  error: null,

  // Fetch all vaults
  fetchVaults: async () => {
    set({ isLoading: true, error: null });

    try {
      const vaults = await VaultService.getVaults();
      set({ vaults, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch vaults',
        isLoading: false,
      });
      throw error;
    }
  },

  // Create new vault
  createVault: async (request: CreateVaultRequest) => {
    set({ isLoading: true, error: null });

    try {
      const newVault = await VaultService.createVault(request);
      
      set((state) => ({
        vaults: [...state.vaults, newVault],
        isLoading: false,
      }));

      return newVault;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create vault',
        isLoading: false,
      });
      throw error;
    }
  },

  // Update vault
  updateVault: async (vaultId: string, request: UpdateVaultRequest) => {
    set({ isLoading: true, error: null });

    try {
      const updatedVault = await VaultService.updateVault(vaultId, request);

      set((state) => ({
        vaults: state.vaults.map((v) =>
          v.id === vaultId ? updatedVault : v
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update vault',
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete vault
  deleteVault: async (vaultId: string) => {
    set({ isLoading: true, error: null });

    try {
      await VaultService.deleteVault(vaultId);

      set((state) => ({
        vaults: state.vaults.filter((v) => v.id !== vaultId),
        currentVaultId:
          state.currentVaultId === vaultId ? null : state.currentVaultId,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete vault',
        isLoading: false,
      });
      throw error;
    }
  },

  // Set current vault
  setCurrentVault: (vaultId: string | null) => {
    set({ currentVaultId: vaultId });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
