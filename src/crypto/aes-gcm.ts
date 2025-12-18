/**
 * AES-256-GCM Encryption/Decryption
 * 
 * SECURITY NOTES:
 * - Uses AES-256-GCM (authenticated encryption with associated data)
 * - GCM provides both confidentiality and authenticity
 * - Random IV generated for each encryption (12 bytes for GCM)
 * - Authentication tag (16 bytes) prevents tampering
 * - All encryption happens CLIENT-SIDE ONLY
 * - Server NEVER sees plaintext data
 */

import { decode as base64Decode, encode as base64Encode } from 'base-64';

export interface EncryptedData {
  encryptedData: string; // Base64-encoded ciphertext
  iv: string; // Base64-encoded initialization vector (12 bytes)
  authTag: string; // Base64-encoded authentication tag (16 bytes)
}

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param plaintext - Data to encrypt (password, note, etc.)
 * @param encryptionKey - Base64-encoded 256-bit key from PBKDF2
 * @returns Encrypted data with IV and auth tag
 */
export async function encryptData(
  plaintext: string,
  encryptionKey: string
): Promise<EncryptedData> {
  if (!plaintext) {
    throw new Error('Plaintext data is required');
  }

  if (!encryptionKey) {
    throw new Error('Encryption key is required');
  }

  try {
    // Convert key from base64 to CryptoKey
    const keyBytes = base64ToBytes(encryptionKey);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes.buffer as ArrayBuffer,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    // Generate random IV (12 bytes for GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Convert plaintext to bytes
    const encoder = new TextEncoder();
    const plaintextBytes = encoder.encode(plaintext);

    // Encrypt data
    // GCM automatically appends 16-byte auth tag to ciphertext
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128, // 128-bit auth tag (16 bytes)
      },
      cryptoKey,
      plaintextBytes
    );

    // Split ciphertext and auth tag
    const encryptedArray = new Uint8Array(encryptedBuffer);
    const ciphertext = encryptedArray.slice(0, -16); // All except last 16 bytes
    const authTag = encryptedArray.slice(-16); // Last 16 bytes

    return {
      encryptedData: bytesToBase64(ciphertext),
      iv: bytesToBase64(iv),
      authTag: bytesToBase64(authTag),
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt encrypted data using AES-256-GCM
 * @param encrypted - Object with encryptedData, iv, authTag
 * @param encryptionKey - Base64-encoded 256-bit key from PBKDF2
 * @returns Decrypted plaintext
 * @throws Error if decryption fails (wrong key or tampered data)
 */
export async function decryptData(
  encrypted: EncryptedData,
  encryptionKey: string
): Promise<string> {
  if (!encrypted?.encryptedData || !encrypted?.iv || !encrypted?.authTag) {
    throw new Error('Invalid encrypted data structure');
  }

  if (!encryptionKey) {
    throw new Error('Encryption key is required');
  }

  try {
    // Convert key from base64 to CryptoKey
    const keyBytes = base64ToBytes(encryptionKey);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes.buffer as ArrayBuffer,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    // Convert base64 strings to Uint8Array
    const ciphertext = base64ToBytes(encrypted.encryptedData);
    const iv = base64ToBytes(encrypted.iv);
    const authTag = base64ToBytes(encrypted.authTag);

    // Combine ciphertext and auth tag (GCM expects them together)
    const encryptedData = new Uint8Array([...ciphertext, ...authTag]);

    // Decrypt data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv.buffer as ArrayBuffer,
        tagLength: 128,
      },
      cryptoKey,
      encryptedData
    );

    // Convert decrypted bytes to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    // Decryption failure means either:
    // 1. Wrong encryption key (wrong master password)
    // 2. Data has been tampered with (auth tag verification failed)
    console.error('Decryption failed:', error);
    throw new Error('Decryption failed - incorrect password or corrupted data');
  }
}

/**
 * Encrypt object (converts to JSON first)
 */
export async function encryptObject(
  obj: any,
  encryptionKey: string
): Promise<EncryptedData> {
  const jsonString = JSON.stringify(obj);
  return encryptData(jsonString, encryptionKey);
}

/**
 * Decrypt to object (parses JSON after decryption)
 */
export async function decryptObject<T = any>(
  encrypted: EncryptedData,
  encryptionKey: string
): Promise<T> {
  const jsonString = await decryptData(encrypted, encryptionKey);
  return JSON.parse(jsonString);
}

// ===== Helper Functions =====

/**
 * Convert base64 string to Uint8Array
 */
function base64ToBytes(base64: string): Uint8Array {
  const binary = base64Decode(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Convert Uint8Array to base64 string
 */
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return base64Encode(binary);
}
