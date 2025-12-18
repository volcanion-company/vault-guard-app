/**
 * Type Definitions for VaultGuard Mobile App
 */

import { EncryptedData } from '@/crypto';

// ===== Authentication Types =====

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ===== Vault Types =====

export interface Vault {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVaultRequest {
  name: string;
  description?: string;
  icon?: string;
}

export interface UpdateVaultRequest {
  name?: string;
  description?: string;
  icon?: string;
}

// ===== Vault Item Types =====

export enum VaultItemType {
  PASSWORD = 'password',
  NOTE = 'secure_note',
  CARD = 'credit_card',
}

export interface VaultItem {
  id: string;
  vaultId: string;
  type: VaultItemType;
  name: string;
  encryptedData: EncryptedData; // Encrypted payload
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
}

// Plaintext data structures (before encryption)
export interface PasswordItemData {
  username: string;
  password: string;
  url?: string;
  notes?: string;
}

export interface SecureNoteData {
  content: string;
}

export interface CreditCardData {
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  notes?: string;
}

export type VaultItemData = PasswordItemData | SecureNoteData | CreditCardData;

// Decrypted vault item (for display)
export interface DecryptedVaultItem extends Omit<VaultItem, 'encryptedData'> {
  data: VaultItemData;
}

export interface CreateVaultItemRequest {
  vaultId: string;
  type: VaultItemType;
  name: string;
  encryptedData: EncryptedData;
  favorite?: boolean;
}

export interface UpdateVaultItemRequest {
  name?: string;
  encryptedData?: EncryptedData;
  favorite?: boolean;
}

// ===== API Response Types =====

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page?: number;
  pageSize?: number;
}

export interface ApiError {
  type?: string;
  title: string;
  status: number;
  errors?: Record<string, string[]>;
  traceId?: string;
}

// ===== App State Types =====

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  encryptionKey: string | null; // Base64-encoded key (in memory only)
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface VaultState {
  vaults: Vault[];
  currentVaultId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface VaultItemState {
  items: VaultItem[];
  decryptedItems: Map<string, DecryptedVaultItem>; // Cache decrypted items
  isLoading: boolean;
  error: string | null;
}

// ===== Security Types =====

export interface DeviceInfo {
  deviceId: string; // UUID persisted in SecureStore
  deviceName?: string;
  platform?: string;
}

export interface BiometricConfig {
  enabled: boolean;
  type?: 'fingerprint' | 'facial';
}

// ===== Utility Types =====

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface FieldVisibility {
  [key: string]: boolean; // Track which password fields are visible
}
