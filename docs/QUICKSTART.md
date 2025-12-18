# VaultGuard Mobile - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 2: Start Development Server

```bash
npm start
```

This will open Expo DevTools in your browser.

### Step 3: Run on Device/Simulator

**iOS (requires Mac):**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Or scan QR code** in Expo DevTools with Expo Go app on your phone.

---

## 📱 First Time Setup

1. **Register Account**
   - Open app → tap "Create Account"
   - Enter email, password (min 8 chars with uppercase, lowercase, number)
   - First name, last name
   - Tap "Create Account"

2. **Create First Vault**
   - Tap "+ New Vault"
   - Enter name (e.g., "Personal")
   - Choose icon
   - Tap "Create Vault"

3. **Add First Password**
   - Open vault → tap "+ Add Item"
   - Select "Password" type
   - Enter:
     - Name (e.g., "Gmail Account")
     - Username/Email
     - Password (or tap "Generate")
     - Website URL (optional)
   - Tap "Save Item"

4. **View Password**
   - Tap on saved item
   - Tap eye icon (👁️) to reveal password
   - Tap copy icon (📋) to copy (auto-clears in 60s)

---

## 🔐 Security Features

### Enable Biometric Unlock

1. Go to Settings (bottom of Vaults screen)
2. Toggle "Face ID / Fingerprint Unlock"
3. Authenticate with biometric
4. Now you can unlock with biometric instead of password

### Lock App

- App auto-locks when sent to background
- Encryption key cleared from memory
- Must re-enter password to unlock

### Logout

- Settings → Logout
- Clears all local data and tokens
- Must login again to access vaults

---

## 🎯 Testing Checklist

Before deploying, test:

- [ ] Register with strong password
- [ ] Login with correct password
- [ ] Login fails with wrong password
- [ ] Create vault
- [ ] Create password item
- [ ] View item (password hidden by default)
- [ ] Reveal password with eye icon
- [ ] Copy password to clipboard
- [ ] Delete item (requires confirmation)
- [ ] Enable biometric unlock
- [ ] Lock app (Settings → Lock)
- [ ] Unlock with password
- [ ] Logout

---

## 🐛 Common Issues

**"Failed to derive encryption key"**
- Master password too short (must be 8+ chars)

**"Network error"**
- Check API endpoints in `src/services/api.ts`
- Ensure backend is running and accessible

**Biometric not working**
- Check device has biometric setup in Settings
- Grant app permission to use biometric

**"Decryption failed"**
- Wrong master password entered
- Try again with correct password

---

## 📁 Key Files to Know

| File | Purpose |
|------|---------|
| `src/app/_layout.tsx` | Root navigation & auth guard |
| `src/crypto/` | Encryption utilities |
| `src/services/api.ts` | API configuration (change endpoints here) |
| `src/store/auth.store.ts` | Auth state & encryption key |
| `app.json` | Expo configuration |

---

## 🔧 Configuration

### Change API Endpoints

Edit `src/services/api.ts`:

```typescript
const AUTH_BASE_URL = 'http://localhost:5000'; // Your auth service
const API_BASE_URL = 'http://localhost:5001';  // Your vault API
```

### Change App Name/Icon

Edit `app.json`:

```json
{
  "expo": {
    "name": "VaultGuard",
    "slug": "vaultguard-mobile",
    "icon": "./assets/icon.png"
  }
}
```

---

## 📦 Build for Production

### iOS

```bash
eas build --platform ios
```

Requires:
- Apple Developer account ($99/year)
- Mac with Xcode

### Android

```bash
eas build --platform android --profile production
```

Output: AAB file for Google Play Store

---

## 🎓 Next Steps

1. Read [README.md](README.md) for full documentation
2. Review [SECURITY.md](SECURITY.md) for security architecture
3. Check [GUIDELINES.md](GUIDELINES.md) for API integration details

---

## 🆘 Need Help?

- **GitHub Issues:** https://github.com/volcanion-company/vault-guard/issues
- **Email:** support@volcanion.vn

---

**Happy Coding! 🚀🔐**
