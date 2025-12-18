# 🔐 VaultGuard Mobile

> **Zero-Knowledge Password Manager** - Your passwords, encrypted on your device, accessible only by you.

[![React Native](https://img.shields.io/badge/React%20Native-0.74-61dafb?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51.0-000020?logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

VaultGuard is a cross-platform mobile password manager built with React Native and Expo, featuring client-side AES-256-GCM encryption and zero-knowledge architecture. Your master password never leaves your device, and all encryption/decryption happens locally.

---

## ✨ Features

### 🔒 Security First
- **Zero-Knowledge Encryption** - Server never sees your passwords
- **AES-256-GCM** - Military-grade authenticated encryption
- **PBKDF2-SHA256** - 100,000 iterations for key derivation
- **Client-Side Only** - All crypto operations on device
- **Biometric Unlock** - Face ID / Touch ID / Fingerprint
- **Auto-Lock** - App locks after inactivity
- **Clipboard Protection** - Auto-clear after 60 seconds

### 📱 User Experience
- **Vault Organization** - Group passwords by category
- **Password Generator** - Strong random passwords
- **Tap to Reveal** - Hide/show sensitive data
- **Search & Filter** - Quick access to items
- **Favorites** - Star important passwords
- **Pull to Refresh** - Sync with backend
- **Offline Support** - Cached data for offline access

### 🏗️ Technical Excellence
- **Clean Architecture** - Separation of concerns
- **Type Safety** - Full TypeScript coverage
- **State Management** - Zustand for reactive state
- **File-Based Routing** - Expo Router navigation
- **Token Auto-Refresh** - Seamless JWT management
- **Error Handling** - Graceful error recovery
- **Performance** - Optimized rendering and caching

---

## 📱 Screenshots

| Login | Vaults | Password Item |
|-------|--------|---------------|
| <kbd>🔐</kbd> | <kbd>📂</kbd> | <kbd>🔑</kbd> |
| Secure authentication | Organized vaults | Encrypted passwords |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Expo CLI** (installed automatically)
- **iOS Simulator** (macOS) or **Android Emulator**
- **Physical device** with Expo Go app (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/volcanion-company/vault-guard-app.git
cd vault-guard-app

# Install dependencies
npm install
# or
yarn install

# Start development server
npm start
# or
yarn start
```

### Configuration

Create or update `src/config/env.ts`:

```typescript
export const ENV = {
  // Backend API endpoints
  AUTH_BASE_URL: 'https://auth.volcanion.vn',
  API_BASE_URL: 'https://api.vaultguard.volcanion.vn',
  
  // Environment
  ENV: 'development', // 'development' | 'staging' | 'production'
};
```

### Run on Device

```bash
# iOS (macOS only)
npm run ios

# Android
npm run android

# Web (experimental)
npm run web
```

---

## 📐 Architecture

VaultGuard follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── app/                    # Expo Router screens (file-based routing)
│   ├── (auth)/            # Authentication flow
│   │   ├── login.tsx      # Login screen
│   │   ├── register.tsx   # Registration screen
│   │   └── unlock.tsx     # App unlock screen
│   └── (app)/             # Main app flow
│       ├── vaults.tsx     # Vault list
│       ├── vault/         # Vault management
│       ├── item/          # Password items
│       └── settings.tsx   # Settings & preferences
├── components/            # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Loading.tsx
│   └── ErrorMessage.tsx
├── crypto/                # Cryptography layer
│   ├── key-derivation.ts  # PBKDF2-SHA256
│   ├── aes-gcm.ts         # AES-256-GCM encryption
│   └── index.ts
├── services/              # API communication layer
│   ├── api.ts             # Axios client with interceptors
│   ├── auth.service.ts    # Authentication API
│   ├── vault.service.ts   # Vault CRUD operations
│   └── vault-item.service.ts # Item CRUD operations
├── store/                 # State management (Zustand)
│   ├── auth.store.ts      # Auth state + encryption key
│   ├── vault.store.ts     # Vaults state
│   └── vault-item.store.ts # Items state + cache
├── types/                 # TypeScript type definitions
│   └── index.ts
├── utils/                 # Utility functions
│   ├── device.ts          # Device ID management
│   ├── clipboard.ts       # Clipboard operations
│   └── validation.ts      # Form validation
└── config/                # Configuration
    └── env.ts             # Environment variables
```

For detailed architecture documentation, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 🔐 Security Model

### Zero-Knowledge Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                         USER DEVICE                           │
│                                                               │
│  Master Password  ──────────────────┐                         │
│       (never stored)                 │                        │
│                                      ▼                        │
│                              PBKDF2-SHA256                    │
│                              (100k iterations)                │
│                                      │                        │
│                                      ▼                        │
│                            Encryption Key (256-bit)           │
│                            (stored in memory only)            │
│                                      │                        │
│  ┌───────────────────────────────────┴──────────────┐         │
│  │                                                   │        │
│  ▼                                                   ▼        │
│ ENCRYPT                                           DECRYPT     │
│ AES-256-GCM                                       AES-256-GCM │
│  │                                                   ▲        │
│  │                                                   │        │
│  ▼                                                   │        │
│ Ciphertext + IV + Auth Tag ────────────────────────────────►  │
└───────────────────────────────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Backend Server │
                    │  (only stores   │
                    │   ciphertext)   │
                    └─────────────────┘
```

### Key Security Features

1. **Master Password Never Transmitted** - Only used locally for key derivation
2. **Client-Side Encryption Only** - Server never sees plaintext
3. **Memory-Only Key Storage** - Encryption key cleared on lock/logout
4. **Authenticated Encryption** - AES-GCM prevents tampering
5. **Secure Key Derivation** - PBKDF2 with 100,000 iterations
6. **Device-Level Security** - Expo SecureStore for tokens
7. **Biometric Protection** - Optional Face ID/Touch ID

For complete security documentation, see [SECURITY.md](SECURITY.md).

---

## 🛠️ Development

### Project Structure

```bash
# Root configuration files
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── app.json               # Expo configuration
├── babel.config.js        # Babel configuration
└── .eslintrc.js          # ESLint rules

# Source code
src/                       # All application code
├── app/                   # Screens (Expo Router)
├── components/            # Reusable components
├── crypto/                # Encryption modules
├── services/              # API clients
├── store/                 # State management
├── types/                 # Type definitions
├── utils/                 # Helpers
└── config/                # Configuration

# Documentation
docs/                      # Additional documentation
├── QUICKSTART.md          # 5-minute setup guide
├── INSTALLATION.md        # Detailed setup
├── CHECKLIST.md           # Pre-launch checklist
└── GUIDELINES.md          # Backend integration guide
```

### Available Scripts

```bash
# Development
npm start                  # Start Expo dev server
npm run ios                # Run on iOS simulator
npm run android            # Run on Android emulator
npm run web                # Run in web browser

# Code Quality
npm run lint               # Run ESLint
npm run type-check         # TypeScript type checking

# Testing (when implemented)
npm test                   # Run tests
npm run test:coverage      # Coverage report
```

### Tech Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | React Native | 0.74.0 | Cross-platform mobile |
| **SDK** | Expo | ~51.0.0 | Development platform |
| **Language** | TypeScript | 5.3.0 | Type safety |
| **Navigation** | Expo Router | ~3.5.0 | File-based routing |
| **State** | Zustand | 4.5.0 | State management |
| **HTTP** | Axios | 1.6.5 | API client |
| **Crypto** | Web Crypto API | Native | Encryption |
| **Storage** | Expo SecureStore | ~13.0.1 | Secure storage |
| **Biometric** | Expo Local Auth | ~14.0.1 | Face ID/Touch ID |

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Guide

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- ✅ Follow TypeScript strict mode
- ✅ Write meaningful commit messages
- ✅ Add comments for complex logic
- ✅ Update documentation for new features
- ✅ Test on both iOS and Android
- ✅ Ensure no TypeScript errors
- ✅ Follow existing code style

---

## 📋 Roadmap

### Version 1.0 (Current)
- ✅ User authentication (register/login/logout)
- ✅ Vault management (create/list/update/delete)
- ✅ Password items (create/view/delete)
- ✅ Client-side encryption (AES-256-GCM)
- ✅ Biometric unlock
- ✅ App lock/unlock
- ✅ Clipboard protection

### Version 1.1 (Planned)
- ⏳ Password strength indicator
- ⏳ Password history
- ⏳ Breach detection integration
- ⏳ Export/import vaults
- ⏳ Two-factor authentication (2FA)
- ⏳ Secure notes and cards

### Version 2.0 (Future)
- 🔮 Secure file attachments
- 🔮 Password sharing
- 🔮 Emergency access
- 🔮 Cross-device sync
- 🔮 Browser extensions
- 🔮 Dark mode

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Volcanion Company

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/volcanion-company/vault-guard-app/issues)
- **Email**: support@volcanion.vn
- **Website**: https://vaultguard.volcanion.vn

---

## 🙏 Acknowledgments

- **React Native Team** - Amazing cross-platform framework
- **Expo Team** - Simplified development experience
- **Web Crypto API** - Standardized cryptography
- **Open Source Community** - Inspiration and libraries

---

## ⚠️ Disclaimer

VaultGuard is designed with security best practices, but:

- 🔴 **Not Audited** - This app has not undergone professional security audit
- 🔴 **Use at Own Risk** - No warranty for data loss or breaches
- 🟡 **Backup Important Data** - Always maintain encrypted backups
- 🟡 **Master Password** - If forgotten, data cannot be recovered
- 🟢 **Open Source** - Code is public for transparency

For production use, consider professional security audit.

---

<div align="center">

**Built with ❤️ and 🔐 by Volcanion Company**

[⭐ Star us on GitHub](https://github.com/volcanion-company/vault-guard-app) | [📖 Read the Docs](docs/) | [🐛 Report Bug](https://github.com/volcanion-company/vault-guard-app/issues)

</div>
