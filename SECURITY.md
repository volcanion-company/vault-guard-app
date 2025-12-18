# 🔒 VaultGuard Security Documentation

> Comprehensive security architecture and cryptographic implementation details

---

## 📑 Table of Contents

- [Security Overview](#security-overview)
- [Zero-Knowledge Architecture](#zero-knowledge-architecture)
- [Cryptographic Specifications](#cryptographic-specifications)
- [Key Management](#key-management)
- [Data Protection](#data-protection)
- [Network Security](#network-security)
- [Device Security](#device-security)
- [Threat Model](#threat-model)
- [Security Best Practices](#security-best-practices)
- [Vulnerability Reporting](#vulnerability-reporting)
- [Security Audit](#security-audit)

---

## 🎯 Security Overview

VaultGuard is built with **security-first** principles, implementing a **zero-knowledge architecture** where:

✅ **User's master password never leaves the device**  
✅ **All encryption/decryption happens client-side only**  
✅ **Server stores only encrypted ciphertext**  
✅ **Even if server is compromised, data remains secure**  
✅ **No backdoors or recovery mechanisms (by design)**

### Security Principles

1. **Zero-Knowledge** - Server never has access to plaintext
2. **Client-Side Encryption** - All crypto operations on device
3. **End-to-End Encryption** - Data encrypted before transmission
4. **Defense in Depth** - Multiple security layers
5. **Principle of Least Privilege** - Minimal permissions
6. **Secure by Default** - Security settings enforced

---

## 🔐 Zero-Knowledge Architecture

### What is Zero-Knowledge?

Zero-knowledge means **the server knows nothing about your data**:

- ❌ Server cannot read your passwords
- ❌ Server cannot decrypt your data
- ❌ Server cannot recover your master password
- ❌ Even database administrators cannot access your data

### How It Works

```
┌──────────────────────────────────────────────────────────┐
│                    USER DEVICE (CLIENT)                   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 1. User enters master password                  │    │
│  │    "MySecurePassword123!"                       │    │
│  └─────────────────────┬───────────────────────────┘    │
│                        │                                 │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 2. Derive encryption key using PBKDF2           │    │
│  │    - Algorithm: PBKDF2-SHA256                   │    │
│  │    - Iterations: 100,000                        │    │
│  │    - Salt: User ID (unique per user)            │    │
│  │    - Output: 256-bit key                        │    │
│  └─────────────────────┬───────────────────────────┘    │
│                        │                                 │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 3. Encryption key stored in memory only         │    │
│  │    ⚠️  NEVER persisted to disk                   │    │
│  │    ⚠️  Cleared on lock/logout                    │    │
│  └─────────────────────┬───────────────────────────┘    │
│                        │                                 │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 4. Encrypt password data using AES-256-GCM      │    │
│  │    - Algorithm: AES-256-GCM                     │    │
│  │    - Random IV: 12 bytes (unique per item)      │    │
│  │    - Auth Tag: 16 bytes (integrity protection)  │    │
│  └─────────────────────┬───────────────────────────┘    │
│                        │                                 │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 5. Send ciphertext to server                    │    │
│  │    POST /vault-items                            │    │
│  │    {                                             │    │
│  │      encryptedData: "base64...",                │    │
│  │      iv: "base64...",                           │    │
│  │      authTag: "base64..."                       │    │
│  │    }                                             │    │
│  └─────────────────────┬───────────────────────────┘    │
└────────────────────────┼─────────────────────────────────┘
                         │
                         │ HTTPS
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                  BACKEND SERVER                           │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 6. Store encrypted data                         │    │
│  │    - Database stores only ciphertext            │    │
│  │    - Server cannot decrypt                      │    │
│  │    - No plaintext at rest                       │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

### Decryption Flow

```
┌──────────────────────────────────────────────────────────┐
│                  BACKEND SERVER                           │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 1. User requests vault item                     │    │
│  │    GET /vault-items/:id                         │    │
│  └─────────────────────┬───────────────────────────┘    │
│                        │                                 │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 2. Return encrypted data                        │    │
│  │    {                                             │    │
│  │      encryptedData: "base64...",                │    │
│  │      iv: "base64...",                           │    │
│  │      authTag: "base64..."                       │    │
│  │    }                                             │    │
│  └─────────────────────┬───────────────────────────┘    │
└────────────────────────┼─────────────────────────────────┘
                         │
                         │ HTTPS
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                    USER DEVICE (CLIENT)                   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 3. Receive encrypted data                       │    │
│  └─────────────────────┬───────────────────────────┘    │
│                        │                                 │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 4. Retrieve encryption key from memory          │    │
│  │    (derived during login/unlock)                │    │
│  └─────────────────────┬───────────────────────────┘    │
│                        │                                 │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 5. Decrypt using AES-256-GCM                    │    │
│  │    - Verify auth tag (integrity check)          │    │
│  │    - Decrypt ciphertext                         │    │
│  │    - Return plaintext                           │    │
│  └─────────────────────┬───────────────────────────┘    │
│                        │                                 │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 6. Display decrypted password                   │    │
│  │    "MyGmailPassword123!"                        │    │
│  │    ⚠️  Plaintext only in app memory              │    │
│  │    ⚠️  Never persisted                           │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## 🔑 Cryptographic Specifications

### 1. Key Derivation Function (KDF)

**Algorithm**: PBKDF2-SHA256

**Parameters**:
```typescript
{
  algorithm: 'PBKDF2',
  hash: 'SHA-256',
  iterations: 100000,  // 100,000 iterations
  saltLength: userId.length,  // User ID as salt (unique per user)
  derivedKeyLength: 256  // 256 bits = 32 bytes
}
```

**Implementation**:

```typescript
// src/crypto/key-derivation.ts
export async function deriveEncryptionKey(
  masterPassword: string,
  userId: string
): Promise<string> {
  const password = new TextEncoder().encode(masterPassword);
  const salt = new TextEncoder().encode(userId);
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    password.buffer as ArrayBuffer,
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  // Derive 256-bit key
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256 // bits
  );
  
  // Convert to base64 for storage
  return bytesToBase64(new Uint8Array(derivedBits));
}
```

**Security Properties**:
- ✅ Computationally expensive (prevents brute force)
- ✅ Deterministic (same password + salt = same key)
- ✅ One-way function (cannot reverse to get password)
- ✅ Unique per user (userId as salt)

**Why 100,000 Iterations?**
- OWASP recommendation: 100,000+ iterations
- NIST SP 800-132: 10,000 minimum, higher recommended
- Balances security vs. performance on mobile devices
- ~200-500ms on modern smartphones

### 2. Symmetric Encryption

**Algorithm**: AES-256-GCM (Galois/Counter Mode)

**Parameters**:
```typescript
{
  algorithm: 'AES-GCM',
  keyLength: 256,      // 256-bit key
  ivLength: 12,        // 12 bytes (96 bits) - GCM standard
  tagLength: 128,      // 16 bytes (128 bits) - authentication tag
}
```

**Implementation**:

```typescript
// src/crypto/aes-gcm.ts
export async function encryptData(
  data: string,
  encryptionKey: string
): Promise<EncryptedData> {
  const keyBytes = base64ToBytes(encryptionKey);
  
  // Import encryption key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes.buffer as ArrayBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  // Generate random IV (12 bytes for GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt data
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, tagLength: 128 },
    cryptoKey,
    new TextEncoder().encode(data)
  );
  
  // Split ciphertext and auth tag
  const encryptedBytes = new Uint8Array(encryptedBuffer);
  const ciphertext = encryptedBytes.slice(0, -16);
  const authTag = encryptedBytes.slice(-16);
  
  return {
    encryptedData: bytesToBase64(ciphertext),
    iv: bytesToBase64(iv),
    authTag: bytesToBase64(authTag),
  };
}
```

**Security Properties**:
- ✅ Authenticated encryption (AEAD)
- ✅ Confidentiality (AES-256)
- ✅ Integrity (GCM auth tag)
- ✅ Protection against tampering
- ✅ Unique IV per encryption (prevents pattern analysis)

**Why AES-256-GCM?**
- Industry standard for authenticated encryption
- NIST approved (FIPS 140-2)
- Used by: Google, Apple, Signal, WhatsApp
- Faster than AES-CBC + HMAC
- Built-in protection against tampering

### 3. Random Number Generation

**Algorithm**: Cryptographically Secure Pseudo-Random Number Generator (CSPRNG)

**Implementation**:
```typescript
// Web Crypto API
const randomBytes = crypto.getRandomValues(new Uint8Array(length));
```

**Used For**:
- Initialization Vectors (IV) - 12 bytes per encryption
- Device ID generation
- Password generation

**Security Properties**:
- ✅ Cryptographically secure
- ✅ Unpredictable
- ✅ Non-repeating (statistically)
- ✅ Platform-native implementation

---

## 🔐 Key Management

### Key Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│ REGISTRATION / LOGIN                                     │
├─────────────────────────────────────────────────────────┤
│ Master Password → PBKDF2 → Encryption Key → Memory      │
│                                                          │
│ State: ✅ Key available for encryption/decryption        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ APP LOCK                                                 │
├─────────────────────────────────────────────────────────┤
│ Clear encryption key from memory                         │
│                                                          │
│ State: ❌ Key unavailable - cannot decrypt               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ UNLOCK                                                   │
├─────────────────────────────────────────────────────────┤
│ Master Password → PBKDF2 → Re-derive Key → Memory       │
│                                                          │
│ State: ✅ Key available again                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ LOGOUT                                                   │
├─────────────────────────────────────────────────────────┤
│ Clear encryption key from memory                         │
│ Clear auth tokens from SecureStore                       │
│ Clear all app state                                      │
│                                                          │
│ State: ❌ Complete cleanup                               │
└─────────────────────────────────────────────────────────┘
```

### Key Storage Rules

| Key Type | Storage | Lifecycle | Purpose |
|----------|---------|-----------|---------|
| **Master Password** | ❌ NEVER stored | User enters each session | Key derivation only |
| **Encryption Key** | Memory only (Zustand) | Login → Lock/Logout | Encrypt/decrypt data |
| **Auth Token** | Expo SecureStore | Login → Logout | API authentication |
| **Refresh Token** | Expo SecureStore | Login → Logout | Token refresh |
| **Device ID** | Expo SecureStore | First launch → Forever | Device identification |

### Secure Storage Implementation

```typescript
// Auth Store - Encryption key in memory only
export const useAuthStore = create<AuthStore>((set) => ({
  encryptionKey: null, // ⚠️ Memory only - NEVER persisted
  
  login: async (email, password) => {
    // 1. Authenticate with backend
    const { token, user } = await authService.login(email, password);
    
    // 2. Store auth token in SecureStore (OS-level encryption)
    await SecureStore.setItemAsync('authToken', token);
    
    // 3. Derive encryption key and store in memory
    const key = await deriveEncryptionKey(password, user.id);
    
    // 4. Update state
    set({ 
      user, 
      token,
      encryptionKey: key, // Memory only
      isLocked: false 
    });
  },
  
  lockApp: () => {
    set({ 
      encryptionKey: null, // Clear from memory
      isLocked: true 
    });
  },
  
  unlockApp: async (masterPassword) => {
    const { user } = get();
    
    // Re-derive encryption key
    const key = await deriveEncryptionKey(masterPassword, user.id);
    
    set({ 
      encryptionKey: key,
      isLocked: false 
    });
  },
  
  logout: async () => {
    // Clear everything
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('refreshToken');
    
    set({ 
      user: null,
      token: null,
      encryptionKey: null, // Clear from memory
      isLocked: false 
    });
  },
}));
```

---

## 🛡️ Data Protection

### Data States

| State | Encryption | Location | Example |
|-------|------------|----------|---------|
| **At Rest** | ✅ Encrypted | Backend database | `{ encryptedData: "...", iv: "...", authTag: "..." }` |
| **In Transit** | ✅ Encrypted + HTTPS | Network | HTTPS protects encrypted data |
| **In Use** | ❌ Plaintext | App memory only | Decrypted for display, then cleared |
| **In Cache** | ✅ Encrypted | Zustand store | Decrypted cache for performance |

### Data Classification

| Data Type | Sensitivity | Protection |
|-----------|-------------|------------|
| **Passwords** | 🔴 Critical | AES-256-GCM encrypted |
| **Usernames** | 🟠 High | AES-256-GCM encrypted |
| **URLs** | 🟡 Medium | AES-256-GCM encrypted |
| **Notes** | 🟡 Medium | AES-256-GCM encrypted |
| **Vault Names** | 🟢 Low | Plaintext (metadata) |
| **User Email** | 🟢 Low | Plaintext (authentication) |
| **Auth Tokens** | 🟠 High | Expo SecureStore |

### Memory Management

```typescript
// Decryption with caching for performance
export const useVaultItemStore = create<VaultItemStore>((set, get) => ({
  decryptedCache: new Map<string, DecryptedItemData>(),
  
  decryptItem: async (item: VaultItem) => {
    const { decryptedCache } = get();
    const { encryptionKey } = useAuthStore.getState();
    
    // Check cache first
    if (decryptedCache.has(item.id)) {
      return decryptedCache.get(item.id)!;
    }
    
    // Decrypt
    const decrypted = await decryptData(
      item.encryptedData,
      item.iv,
      item.authTag,
      encryptionKey
    );
    
    // Cache for future use
    decryptedCache.set(item.id, JSON.parse(decrypted));
    
    return JSON.parse(decrypted);
  },
  
  clearCache: () => {
    // Clear cache on lock/logout
    set({ decryptedCache: new Map() });
  },
}));
```

---

## 🌐 Network Security

### HTTPS Enforcement

```typescript
// src/config/env.ts
export const ENV = {
  AUTH_BASE_URL: 'https://auth.volcanion.vn', // ✅ HTTPS only
  API_BASE_URL: 'https://api.vaultguard.volcanion.vn', // ✅ HTTPS only
};
```

**Why HTTPS?**
- ✅ Encrypts data in transit
- ✅ Prevents man-in-the-middle attacks
- ✅ Validates server identity (certificate)
- ✅ Industry standard

### Token Management

```typescript
// src/services/api.ts
const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
});

// Add auth token to all requests
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatic token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // Attempt refresh
        const newToken = await refreshAuthToken();
        useAuthStore.getState().setToken(newToken);
        
        // Retry original request
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return axios(error.config);
      } catch (refreshError) {
        // Refresh failed - logout
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);
```

### Request Security

**Headers Added**:
```typescript
{
  'Authorization': 'Bearer <jwt-token>',
  'X-Device-Id': '<uuid>',
  'Content-Type': 'application/json',
}
```

**Security Features**:
- ✅ JWT authentication
- ✅ Device tracking (audit log)
- ✅ Automatic token refresh
- ✅ Request timeout (10s)
- ✅ Error handling

---

## 📱 Device Security

### Expo SecureStore

Used for storing:
- ✅ Auth tokens (encrypted by OS)
- ✅ Refresh tokens
- ✅ Device ID

```typescript
// src/utils/device.ts
export async function getDeviceId(): Promise<string> {
  let deviceId = await SecureStore.getItemAsync('deviceId');
  
  if (!deviceId) {
    // Generate UUID for new device
    deviceId = uuid.v4();
    await SecureStore.setItemAsync('deviceId', deviceId);
  }
  
  return deviceId;
}
```

**Security Properties**:
- ✅ OS-level encryption (Keychain on iOS, Keystore on Android)
- ✅ Hardware-backed encryption (on supported devices)
- ✅ Isolated per-app storage
- ✅ Survives app updates
- ✅ Deleted on app uninstall

### Biometric Authentication

```typescript
// src/app/(auth)/unlock.tsx
import * as LocalAuthentication from 'expo-local-authentication';

async function unlockWithBiometric() {
  // Check if biometric is available
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  
  if (!hasHardware || !isEnrolled) {
    // Fallback to password
    return false;
  }
  
  // Authenticate
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock VaultGuard',
    fallbackLabel: 'Use Master Password',
  });
  
  if (result.success) {
    // Still need master password for key derivation
    // Biometric only skips password input UI
    const savedPassword = await getEncryptedMasterPassword();
    await unlockApp(savedPassword);
  }
}
```

**Important**: Biometric auth only for UX convenience. Master password still required for key derivation.

### Clipboard Protection

```typescript
// src/utils/clipboard.ts
export async function copyToClipboard(text: string) {
  await Clipboard.setStringAsync(text);
  
  // Auto-clear after 60 seconds
  setTimeout(async () => {
    const current = await Clipboard.getStringAsync();
    if (current === text) {
      await Clipboard.setStringAsync(''); // Clear
    }
  }, 60000); // 60 seconds
}
```

---

## 🎯 Threat Model

### Threats We Protect Against

| Threat | Protection | Status |
|--------|------------|--------|
| **Server Breach** | Zero-knowledge encryption | ✅ Protected |
| **Database Leak** | All data encrypted | ✅ Protected |
| **Man-in-the-Middle** | HTTPS encryption | ✅ Protected |
| **Brute Force** | PBKDF2 100k iterations | ✅ Protected |
| **Password Reuse** | Unique master password | ⚠️ User responsibility |
| **Device Theft** | App lock + biometric | ✅ Protected |
| **Clipboard Sniffing** | Auto-clear after 60s | ✅ Mitigated |
| **Memory Dump** | Key cleared on lock | ⚠️ Partially protected |
| **Phishing** | No password recovery | ⚠️ User education needed |

### Threats We Don't Protect Against

| Threat | Why Not | Mitigation |
|--------|---------|------------|
| **Weak Master Password** | User choice | Password strength indicator (future) |
| **Device Malware** | OS-level issue | Keep OS updated |
| **Shoulder Surfing** | Physical security | User awareness |
| **Keyloggers** | OS-level issue | Trusted device only |
| **Social Engineering** | Human factor | User education |

---

## 🛠️ Security Best Practices

### For Users

1. **Use Strong Master Password**
   - ✅ 12+ characters
   - ✅ Mix of uppercase, lowercase, numbers, symbols
   - ✅ Unique (not used elsewhere)
   - ❌ Never share with anyone

2. **Enable Biometric Unlock**
   - Convenience without compromising security
   - Still requires master password for key derivation

3. **Keep Device Secure**
   - ✅ Use device passcode/PIN
   - ✅ Keep OS updated
   - ✅ Don't jailbreak/root device
   - ❌ Don't install untrusted apps

4. **Lock App When Not in Use**
   - Auto-lock after inactivity
   - Manual lock when needed

### For Developers

1. **Never Log Sensitive Data**
   ```typescript
   // ❌ NEVER
   console.log('Password:', password);
   
   // ✅ Safe
   console.log('Password length:', password.length);
   ```

2. **Always Validate Input**
   ```typescript
   function createVault(name: string) {
     if (!name || name.trim().length === 0) {
       throw new Error('Invalid vault name');
     }
   }
   ```

3. **Use TypeScript Strict Mode**
   - Catch type errors at compile time
   - Prevent undefined/null bugs

4. **Handle Errors Gracefully**
   ```typescript
   try {
     await encryptData(data, key);
   } catch (error) {
     // Don't expose internal errors to user
     showError('Encryption failed. Please try again.');
     // Log for debugging (no sensitive data)
     console.error('Encryption error:', error.message);
   }
   ```

---

## 🚨 Vulnerability Reporting

### How to Report

**DO NOT** create public GitHub issues for security vulnerabilities.

Instead, email: **security@volcanion.vn**

Include:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **24 hours**: Initial response
- **72 hours**: Severity assessment
- **7 days**: Fix development (critical issues)
- **30 days**: Public disclosure (after fix)

### Responsible Disclosure

We follow responsible disclosure:
1. Report received
2. Vulnerability confirmed
3. Fix developed and tested
4. Fix deployed to production
5. Public disclosure with credit

---

## 🔍 Security Audit

### Self-Audit Checklist

- [ ] No sensitive data logged
- [ ] No encryption key persisted
- [ ] HTTPS enforced
- [ ] Input validation implemented
- [ ] Error messages don't leak info
- [ ] Dependencies up to date
- [ ] No hardcoded secrets
- [ ] TypeScript strict mode enabled
- [ ] Proper error handling
- [ ] Secure token management

### Recommended Professional Audits

Before production deployment:

1. **Cryptographic Implementation Audit**
   - Verify PBKDF2 implementation
   - Verify AES-GCM implementation
   - Check key management

2. **Penetration Testing**
   - API security testing
   - Network traffic analysis
   - Mobile app security

3. **Code Review**
   - Security-focused code review
   - Dependency vulnerability scan
   - OWASP Mobile Top 10 compliance

---

## 📚 Further Reading

### Standards & Specifications

- [NIST SP 800-132](https://csrc.nist.gov/publications/detail/sp/800-132/final) - PBKDF2 Recommendations
- [NIST SP 800-38D](https://csrc.nist.gov/publications/detail/sp/800-38d/final) - GCM Mode Specification
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security-testing-guide/)
- [Web Crypto API](https://www.w3.org/TR/WebCryptoAPI/)

### Best Practices

- [OWASP Cryptographic Storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [OWASP Key Management](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)
- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

---

## ⚠️ Disclaimer

**VaultGuard has NOT been professionally audited.**

- This app implements security best practices
- Code is open source for transparency
- Use at your own risk
- For production use, professional security audit recommended
- No warranty for data loss or security breaches

**If you forget your master password, your data CANNOT be recovered.**

---

<div align="center">

**Security is a journey, not a destination**

[⬅️ Back to README](README.md) | [🏗️ Architecture](ARCHITECTURE.md) | [🤝 Contributing](CONTRIBUTING.md)

---

**Questions? Contact: security@volcanion.vn**

</div>
