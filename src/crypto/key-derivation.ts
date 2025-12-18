/**
 * Key Derivation using PBKDF2-SHA256
 * 
 * SECURITY NOTES:
 * - Uses PBKDF2 with 100,000 iterations (OWASP recommended minimum)
 * - Salt is user ID (unique per user)
 * - Master password NEVER stored or sent to server
 * - Derived key NEVER persisted, only kept in memory during session
 */

import * as Crypto from 'expo-crypto';
import { encode as base64Encode } from 'base-64';

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 32; // 256 bits for AES-256

/**
 * Derive encryption key from master password
 * @param masterPassword - User's master password (NEVER stored)
 * @param userId - User's unique ID (used as salt)
 * @returns Base64-encoded 256-bit encryption key
 */
export async function deriveEncryptionKey(
  masterPassword: string,
  userId: string
): Promise<string> {
  if (!masterPassword || masterPassword.length < 8) {
    throw new Error('Master password must be at least 8 characters');
  }

  if (!userId) {
    throw new Error('User ID is required as salt');
  }

  try {
    // Convert inputs to byte arrays
    const passwordBytes = stringToBytes(masterPassword);
    const saltBytes = stringToBytes(userId);

    // Derive key using PBKDF2
    // Note: expo-crypto uses PBKDF2-SHA1 by default, for SHA-256 we need Web Crypto API
    const keyBytes = await pbkdf2Sha256(
      passwordBytes,
      saltBytes,
      PBKDF2_ITERATIONS,
      KEY_LENGTH
    );

    // Return as base64 for storage in memory
    return bytesToBase64(keyBytes);
  } catch (error) {
    console.error('Key derivation failed:', error);
    throw new Error('Failed to derive encryption key');
  }
}

/**
 * PBKDF2-SHA256 implementation using Web Crypto API
 * Expo-crypto doesn't support SHA-256, so we use SubtleCrypto
 */
async function pbkdf2Sha256(
  password: Uint8Array,
  salt: Uint8Array,
  iterations: number,
  keyLength: number
): Promise<Uint8Array> {
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    password.buffer as ArrayBuffer,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // Derive bits using PBKDF2-SHA256
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    keyLength * 8 // bits
  );

  return new Uint8Array(derivedBits);
}

/**
 * Verify master password by attempting to decrypt a test item
 * @param masterPassword - Password to verify
 * @param userId - User ID
 * @param encryptedTestData - Known encrypted data (from user's first vault item)
 * @returns true if password is correct
 */
export async function verifyMasterPassword(
  masterPassword: string,
  userId: string,
  encryptedTestData: { encryptedData: string; iv: string; authTag: string }
): Promise<boolean> {
  try {
    const key = await deriveEncryptionKey(masterPassword, userId);
    
    // Attempt to decrypt test data
    // If decryption succeeds, password is correct
    const aesGcm = require('./aes-gcm');
    await aesGcm.decryptData(encryptedTestData, key);
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Convert string to Uint8Array
 */
function stringToBytes(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

/**
 * Convert Uint8Array to base64 string
 */
function bytesToBase64(bytes: Uint8Array): string {
  // Convert to binary string
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return base64Encode(binary);
}
