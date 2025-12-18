# 🏗️ VaultGuard Architecture

> Comprehensive technical architecture documentation for VaultGuard mobile application

---

## 📑 Table of Contents

- [Overview](#overview)
- [Architecture Principles](#architecture-principles)
- [Directory Structure](#directory-structure)
- [Layer Architecture](#layer-architecture)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [State Management](#state-management)
- [API Communication](#api-communication)
- [Navigation System](#navigation-system)
- [Component Hierarchy](#component-hierarchy)
- [Performance Optimization](#performance-optimization)

---

## 🎯 Overview

VaultGuard follows **Clean Architecture** principles with clear separation of concerns, ensuring maintainability, testability, and scalability. The application is built with React Native and Expo, using TypeScript for type safety.

### Core Architecture Goals

1. **Separation of Concerns** - Each layer has a single responsibility
2. **Dependency Inversion** - High-level modules don't depend on low-level ones
3. **Testability** - Each component can be tested in isolation
4. **Security by Design** - Zero-knowledge encryption at the core
5. **Performance** - Optimized for mobile devices
6. **Developer Experience** - Clear structure and conventions

---

## 🎨 Architecture Principles

### 1. Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  (React Components, Screens, UI State)                      │
├─────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                        │
│  (Business Logic, Use Cases, Store Management)              │
├─────────────────────────────────────────────────────────────┤
│                      DOMAIN LAYER                           │
│  (Entities, Types, Core Business Rules)                     │
├─────────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE LAYER                      │
│  (API Clients, Crypto, Storage, External Services)          │
└─────────────────────────────────────────────────────────────┘
```

### 2. Dependency Flow

```
Presentation → Application → Domain ← Infrastructure
```

- **Presentation** depends on Application
- **Application** depends on Domain
- **Infrastructure** depends on Domain
- **Domain** has no dependencies (pure business logic)

### 3. Data Flow

```
User Input → Component → Store → Service → API
                ↓          ↓        ↓
              State    Business   HTTP
             Update     Logic   Request
```

---

## 📁 Directory Structure

```
vault-guard-app/
│
├── src/                           # Source code root
│   │
│   ├── app/                       # 🎯 PRESENTATION LAYER
│   │   ├── _layout.tsx           # Root layout with auth guard
│   │   ├── (auth)/               # Authentication flow (route group)
│   │   │   ├── _layout.tsx       # Auth layout
│   │   │   ├── login.tsx         # Login screen
│   │   │   ├── register.tsx      # Registration screen
│   │   │   └── unlock.tsx        # App unlock screen
│   │   └── (app)/                # Main app flow (route group)
│   │       ├── _layout.tsx       # App layout with tabs
│   │       ├── vaults.tsx        # Vault list screen
│   │       ├── settings.tsx      # Settings screen
│   │       ├── vault/            # Vault management
│   │       │   ├── [id].tsx      # Vault detail (dynamic route)
│   │       │   └── create.tsx    # Create vault
│   │       └── item/             # Item management
│   │           ├── [id].tsx      # Item detail (dynamic route)
│   │           └── create.tsx    # Create item
│   │
│   ├── components/               # 🎨 UI COMPONENTS
│   │   ├── Button.tsx            # Reusable button component
│   │   ├── Input.tsx             # Input with password toggle
│   │   ├── Loading.tsx           # Loading spinner
│   │   └── ErrorMessage.tsx      # Error display component
│   │
│   ├── store/                    # 🗄️ APPLICATION LAYER
│   │   ├── auth.store.ts         # Auth state + encryption key
│   │   ├── vault.store.ts        # Vaults state + actions
│   │   └── vault-item.store.ts   # Items state + cache
│   │
│   ├── services/                 # 🌐 INFRASTRUCTURE LAYER
│   │   ├── api.ts                # Axios client configuration
│   │   ├── auth.service.ts       # Authentication API
│   │   ├── vault.service.ts      # Vault API operations
│   │   └── vault-item.service.ts # Item API operations
│   │
│   ├── crypto/                   # 🔐 INFRASTRUCTURE LAYER
│   │   ├── key-derivation.ts     # PBKDF2-SHA256 implementation
│   │   ├── aes-gcm.ts            # AES-256-GCM encryption
│   │   └── index.ts              # Crypto exports
│   │
│   ├── types/                    # 📐 DOMAIN LAYER
│   │   └── index.ts              # TypeScript type definitions
│   │
│   ├── utils/                    # 🛠️ INFRASTRUCTURE LAYER
│   │   ├── device.ts             # Device ID management
│   │   ├── clipboard.ts          # Clipboard operations
│   │   └── validation.ts         # Form validation
│   │
│   └── config/                   # ⚙️ CONFIGURATION
│       └── env.ts                # Environment variables
│
├── assets/                        # 🖼️ STATIC ASSETS
│   └── README.md                 # Asset guidelines
│
├── docs/                          # 📚 DOCUMENTATION
│   ├── QUICKSTART.md
│   ├── INSTALLATION.md
│   ├── CHECKLIST.md
│   └── GUIDELINES.md
│
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── app.json                       # Expo configuration
├── babel.config.js                # Babel configuration
├── .eslintrc.js                  # ESLint rules
└── .gitignore                    # Git ignore rules
```

---

## 🏛️ Layer Architecture

### 1. Presentation Layer (`src/app/` + `src/components/`)

**Responsibility**: User interface and user interaction

**Technologies**:
- React Native components
- Expo Router for navigation
- React hooks for component logic

**Key Files**:

```typescript
// Example: Login Screen (src/app/(auth)/login.tsx)
export default function LoginScreen() {
  const { login, loading, error } = useAuthStore();
  
  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    // Navigation handled automatically by Expo Router
  };
  
  return (
    <View>
      <Input label="Email" />
      <Input label="Password" secureTextEntry />
      <Button onPress={handleLogin}>Login</Button>
    </View>
  );
}
```

**Patterns**:
- ✅ Components are presentational
- ✅ Business logic in stores/hooks
- ✅ File-based routing (Expo Router)
- ✅ Atomic design for components

---

### 2. Application Layer (`src/store/`)

**Responsibility**: Business logic and state management

**Technologies**:
- Zustand for state management
- React hooks integration

**Key Stores**:

#### Auth Store (`auth.store.ts`)

```typescript
interface AuthStore {
  // State
  user: User | null;
  token: string | null;
  encryptionKey: string | null; // ⚠️ Memory only!
  isLocked: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  lockApp: () => void;
  unlockApp: (masterPassword: string) => Promise<void>;
}
```

**Critical**: Encryption key stored in memory only, cleared on:
- App lock
- Logout
- App termination

#### Vault Store (`vault.store.ts`)

```typescript
interface VaultStore {
  vaults: Vault[];
  loading: boolean;
  error: string | null;
  
  fetchVaults: () => Promise<void>;
  createVault: (data: CreateVaultDto) => Promise<void>;
  updateVault: (id: string, data: UpdateVaultDto) => Promise<void>;
  deleteVault: (id: string) => Promise<void>;
}
```

#### Vault Item Store (`vault-item.store.ts`)

```typescript
interface VaultItemStore {
  items: VaultItem[];
  decryptedCache: Map<string, DecryptedItemData>; // 🚀 Performance optimization
  loading: boolean;
  error: string | null;
  
  fetchItems: (vaultId: string) => Promise<void>;
  createItem: (data: CreateItemDto) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  decryptItem: (item: VaultItem) => Promise<DecryptedItemData>;
}
```

**Pattern**: Decryption cache to avoid re-decrypting same items

---

### 3. Domain Layer (`src/types/`)

**Responsibility**: Core business entities and types

**Technologies**: TypeScript interfaces and types

**Key Types**:

```typescript
// User
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// Vault
interface Vault {
  id: string;
  name: string;
  description?: string;
  icon: VaultIcon;
  itemCount: number;
  isFavorite: boolean;
  createdAt: string;
}

// Vault Item (Encrypted)
interface VaultItem {
  id: string;
  vaultId: string;
  type: ItemType; // 'password' | 'note' | 'card'
  encryptedData: string;
  iv: string;
  authTag: string;
  isFavorite: boolean;
  createdAt: string;
}

// Decrypted Data
interface DecryptedItemData {
  name: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
}

// Encrypted Data Structure
interface EncryptedData {
  encryptedData: string; // Base64
  iv: string;            // Base64 (12 bytes)
  authTag: string;       // Base64 (16 bytes)
}
```

**Patterns**:
- ✅ Pure data structures
- ✅ No implementation logic
- ✅ Strong typing throughout

---

### 4. Infrastructure Layer (`src/services/` + `src/crypto/` + `src/utils/`)

**Responsibility**: External interactions and implementations

#### API Services (`src/services/`)

**Base API Client** (`api.ts`):

```typescript
const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
});

// Request Interceptor: Add auth token + device ID
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  const deviceId = getDeviceId();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (deviceId) {
    config.headers['X-Device-Id'] = deviceId;
  }
  
  return config;
});

// Response Interceptor: Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      await refreshToken();
      // Retry original request
    }
    return Promise.reject(error);
  }
);
```

**Auth Service** (`auth.service.ts`):

```typescript
export const authService = {
  login: (email: string, password: string) => 
    axios.post('/auth/login', { email, password }),
    
  register: (email: string, password: string) =>
    axios.post('/auth/register', { email, password }),
    
  refreshToken: (refreshToken: string) =>
    axios.post('/auth/refresh', { refreshToken }),
    
  logout: () =>
    axios.post('/auth/logout'),
};
```

**Vault Service** (`vault.service.ts`):

```typescript
export const vaultService = {
  getAll: () => apiClient.get<Vault[]>('/vaults'),
  
  create: (data: CreateVaultDto) => 
    apiClient.post<Vault>('/vaults', data),
    
  update: (id: string, data: UpdateVaultDto) =>
    apiClient.put<Vault>(`/vaults/${id}`, data),
    
  delete: (id: string) =>
    apiClient.delete(`/vaults/${id}`),
};
```

#### Crypto Module (`src/crypto/`)

**Key Derivation** (`key-derivation.ts`):

```typescript
/**
 * Derives 256-bit encryption key from master password
 * @param masterPassword - User's master password
 * @param userId - User ID (used as salt)
 * @returns Base64-encoded encryption key
 */
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
  
  // Derive 256-bit key using PBKDF2-SHA256
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000, // 100k iterations
      hash: 'SHA-256',
    },
    keyMaterial,
    256 // 256 bits = 32 bytes
  );
  
  return bytesToBase64(new Uint8Array(derivedBits));
}
```

**AES-GCM Encryption** (`aes-gcm.ts`):

```typescript
/**
 * Encrypts data using AES-256-GCM
 * @param data - Plaintext string
 * @param encryptionKey - Base64-encoded key
 * @returns Encrypted data with IV and auth tag
 */
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
  
  // Generate random 12-byte IV
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

---

## 🔄 Data Flow

### Complete User Flow Example: Creating a Password

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER INTERACTION                                         │
│    User fills form and clicks "Save"                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. PRESENTATION LAYER (item/create.tsx)                     │
│    - Validate input                                         │
│    - Get encryption key from auth store                     │
│    - Call createItem() from vault-item store                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. APPLICATION LAYER (vault-item.store.ts)                  │
│    - Prepare item data                                      │
│    - Call encryption function                               │
│    - Call API service                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. INFRASTRUCTURE LAYER - CRYPTO (aes-gcm.ts)               │
│    - Encrypt password data using AES-256-GCM                │
│    - Return { encryptedData, iv, authTag }                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. INFRASTRUCTURE LAYER - API (vault-item.service.ts)       │
│    - POST /vault-items with encrypted data                  │
│    - Include auth token and device ID (interceptor)         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. BACKEND SERVER                                           │
│    - Store encrypted data (cannot decrypt)                  │
│    - Return created item with ID                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. APPLICATION LAYER (vault-item.store.ts)                  │
│    - Update local state with new item                       │
│    - Navigate back to vault                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. PRESENTATION LAYER (vault/[id].tsx)                      │
│    - Re-render with updated item list                       │
│    - Show success message                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Architecture

### Encryption Key Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│ LOGIN / REGISTER                                            │
│                                                             │
│  Master Password ──┐                                        │
│                    │                                        │
│                    ▼                                        │
│         deriveEncryptionKey(password, userId)               │
│                    │                                        │
│                    ▼                                        │
│         Store in auth.store (MEMORY ONLY)                   │
│          Available for encrypt/decrypt                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ APP LOCK                                                    │
│                                                             │
│  User locks app ──► Clear encryption key from memory        │
│                     Cannot decrypt until unlock             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ UNLOCK                                                      │
│                                                             │
│  Master Password ──┐                                        │
│                    │                                        │
│                    ▼                                        │
│         deriveEncryptionKey(password, userId)               │
│                    │                                        │
│                    ▼                                        │
│         Restore in auth.store                               │
│         App unlocked, can decrypt again                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ LOGOUT                                                      │
│                                                             │
│  User logs out ──► Clear encryption key from memory         │
│                    Clear auth token from SecureStore        │
│                    Clear all state                          │
│                    Complete cleanup                         │
└─────────────────────────────────────────────────────────────┘
```

### Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Device Security                                    │
│  - Expo SecureStore (OS-level encryption)                   │
│  - Biometric authentication (Face ID / Touch ID)            │
│  - Device ID tracking                                       │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Application Security                               │
│  - App lock/unlock mechanism                                │
│  - Memory-only encryption key storage                       │
│  - Clipboard auto-clear (60s)                               │
│  - Input validation                                         │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Cryptographic Security                             │
│  - PBKDF2-SHA256 (100k iterations)                          │
│  - AES-256-GCM (authenticated encryption)                   │
│  - Random IV per encryption                                 │
│  - Client-side only operations                              │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Network Security                                   │
│  - HTTPS only                                               │
│  - JWT token authentication                                 │
│  - Automatic token refresh                                  │
│  - Request/response interceptors                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 State Management

### Zustand Store Pattern

```typescript
// Example: Vault Store Implementation
import { create } from 'zustand';
import { vaultService } from '@/services/vault.service';

interface VaultStore {
  // State
  vaults: Vault[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchVaults: () => Promise<void>;
  createVault: (data: CreateVaultDto) => Promise<void>;
  updateVault: (id: string, data: UpdateVaultDto) => Promise<void>;
  deleteVault: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useVaultStore = create<VaultStore>((set, get) => ({
  // Initial state
  vaults: [],
  loading: false,
  error: null,
  
  // Fetch vaults
  fetchVaults: async () => {
    set({ loading: true, error: null });
    try {
      const response = await vaultService.getAll();
      set({ vaults: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  // Create vault
  createVault: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await vaultService.create(data);
      set(state => ({
        vaults: [...state.vaults, response.data],
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  // Update vault
  updateVault: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await vaultService.update(id, data);
      set(state => ({
        vaults: state.vaults.map(v => 
          v.id === id ? response.data : v
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  // Delete vault
  deleteVault: async (id) => {
    set({ loading: true, error: null });
    try {
      await vaultService.delete(id);
      set(state => ({
        vaults: state.vaults.filter(v => v.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  // Clear error
  clearError: () => set({ error: null }),
}));
```

---

## 🧭 Navigation System

VaultGuard uses **Expo Router** (file-based routing):

### Route Structure

```
app/
├── _layout.tsx                 # Root layout
│
├── (auth)/                     # Auth group (stack navigation)
│   ├── _layout.tsx
│   ├── login.tsx              # /login
│   ├── register.tsx           # /register
│   └── unlock.tsx             # /unlock
│
└── (app)/                      # App group (tabs navigation)
    ├── _layout.tsx
    ├── vaults.tsx             # /vaults (tab)
    ├── settings.tsx           # /settings (tab)
    │
    ├── vault/
    │   ├── [id].tsx           # /vault/:id
    │   └── create.tsx         # /vault/create
    │
    └── item/
        ├── [id].tsx           # /item/:id
        └── create.tsx         # /item/create
```

### Navigation Guards

```typescript
// Root layout with auth guard
export default function RootLayout() {
  const { token, isLocked } = useAuthStore();
  
  useEffect(() => {
    if (!token) {
      router.replace('/login');
    } else if (isLocked) {
      router.replace('/unlock');
    }
  }, [token, isLocked]);
  
  return <Slot />;
}
```

---

## 🎨 Component Hierarchy

### Atomic Design Pattern

```
Atoms (Basic)
├── Button.tsx
├── Input.tsx
├── Loading.tsx
└── ErrorMessage.tsx

Molecules (Composed)
├── PasswordField.tsx (Input + Toggle)
├── VaultCard.tsx (Icon + Text + Actions)
└── ItemCard.tsx (Icon + Title + Subtitle)

Organisms (Complex)
├── VaultList.tsx (Multiple VaultCards)
├── ItemList.tsx (Multiple ItemCards)
└── SettingsPanel.tsx (Multiple sections)

Templates (Layouts)
├── AuthLayout.tsx
├── AppLayout.tsx
└── DetailLayout.tsx

Pages (Screens)
├── LoginScreen.tsx
├── VaultsScreen.tsx
└── SettingsScreen.tsx
```

---

## ⚡ Performance Optimization

### 1. Decryption Caching

```typescript
// vault-item.store.ts
interface VaultItemStore {
  decryptedCache: Map<string, DecryptedItemData>;
  
  decryptItem: async (item: VaultItem) => {
    // Check cache first
    if (this.decryptedCache.has(item.id)) {
      return this.decryptedCache.get(item.id)!;
    }
    
    // Decrypt and cache
    const decrypted = await decryptData(
      item.encryptedData,
      item.iv,
      item.authTag,
      encryptionKey
    );
    
    this.decryptedCache.set(item.id, decrypted);
    return decrypted;
  },
}
```

### 2. Lazy Loading

```typescript
// Only load items when vault is opened
const VaultDetail = () => {
  const { id } = useLocalSearchParams();
  const { fetchItems } = useVaultItemStore();
  
  useEffect(() => {
    fetchItems(id); // Lazy load
  }, [id]);
};
```

### 3. Memoization

```typescript
// Memoize expensive computations
const sortedVaults = useMemo(() => {
  return vaults.sort((a, b) => 
    a.name.localeCompare(b.name)
  );
}, [vaults]);
```

### 4. Virtual Lists

```typescript
// For large lists, use FlatList with optimization
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>
```

---

## 🔗 Dependencies Graph

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                    │
│                   (app/, components/)                   │
└──────────────────┬──────────────────────────────────────┘
                   │ depends on
                   ▼
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                      │
│                      (store/)                           │
└──────┬───────────────────────────┬──────────────────────┘
       │ depends on                │ depends on
       ▼                           ▼
┌──────────────────┐      ┌────────────────────────────┐
│  Domain Layer    │      │  Infrastructure Layer      │
│    (types/)      │      │  (services/, crypto/,      │
│                  │      │   utils/, config/)         │
└──────────────────┘      └────────────────────────────┘
```

---

## 📚 Further Reading

- [README.md](README.md) - Project overview
- [SECURITY.md](SECURITY.md) - Security documentation
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [docs/QUICKSTART.md](docs/QUICKSTART.md) - Quick setup guide
- [docs/INSTALLATION.md](docs/INSTALLATION.md) - Detailed installation

---

<div align="center">

**Architecture designed for security, performance, and maintainability**

[⬅️ Back to README](README.md)

</div>
