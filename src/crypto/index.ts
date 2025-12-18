/**
 * Crypto Module - Central export for all cryptographic operations
 * 
 * SECURITY ARCHITECTURE:
 * - Zero-knowledge: Server never sees plaintext
 * - Client-side encryption: All crypto operations happen on device
 * - PBKDF2-SHA256: Key derivation with 100k iterations
 * - AES-256-GCM: Authenticated encryption
 * - No key persistence: Encryption key only in memory during session
 */

export { deriveEncryptionKey, verifyMasterPassword } from './key-derivation';
export { encryptData, decryptData, encryptObject, decryptObject } from './aes-gcm';
export type { EncryptedData } from './aes-gcm';

/**
 * Security Best Practices:
 * 
 * 1. NEVER store master password
 *    - Not in SecureStore, not in memory after key derivation
 * 
 * 2. NEVER persist encryption key
 *    - Derive on login, keep in Zustand store (memory only)
 *    - Clear on logout or app background
 * 
 * 3. NEVER log sensitive data
 *    - No passwords, keys, or plaintext in console.log
 * 
 * 4. ALWAYS encrypt before sending to server
 *    - Check that data is encrypted before API call
 * 
 * 5. ALWAYS verify data integrity
 *    - GCM auth tag prevents tampering
 *    - Decryption failure = wrong key or corrupted data
 */
