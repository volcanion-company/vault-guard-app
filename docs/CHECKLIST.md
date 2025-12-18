# 📋 VaultGuard Mobile - Pre-Launch Checklist

Use this checklist before deploying to production or app stores.

## ✅ Code Quality

- [ ] Run TypeScript type checking: `npm run type-check`
- [ ] Run ESLint: `npm run lint`
- [ ] Fix all TypeScript errors
- [ ] Fix all ESLint warnings
- [ ] Remove all `console.log` statements (except warnings/errors)
- [ ] Remove all TODO comments
- [ ] Code review completed

## ✅ Security Audit

### Critical Security Checks

- [ ] Master password is NEVER logged anywhere
- [ ] Master password is NEVER stored (not in state, SecureStore, or memory after key derivation)
- [ ] Encryption key is NEVER persisted to disk
- [ ] Encryption key is ONLY in Zustand store (memory)
- [ ] Encryption key is cleared on logout
- [ ] Encryption key is cleared on app lock
- [ ] All sensitive data uses `encryptData()` before API calls
- [ ] No plaintext passwords in API requests/responses
- [ ] All API calls include `Authorization` header
- [ ] All VaultGuard API calls include `X-Device-Id` header
- [ ] Token refresh works on 401 responses
- [ ] Clipboard auto-clears after 60 seconds
- [ ] No sensitive data in error messages
- [ ] No sensitive data in logs

### Crypto Implementation

- [ ] PBKDF2-SHA256 uses 100,000 iterations
- [ ] AES-256-GCM encryption is used (not CBC or ECB)
- [ ] Random IV generated for each encryption
- [ ] Authentication tag verified on decryption
- [ ] Proper error handling on decryption failures

## ✅ Functionality Testing

### Authentication Flow

- [ ] User can register with valid email/password
- [ ] Registration fails with weak password
- [ ] Registration fails with invalid email
- [ ] User can login with correct credentials
- [ ] Login fails with wrong password
- [ ] Login fails with non-existent email
- [ ] Token refresh works automatically
- [ ] User can logout successfully
- [ ] Logout clears all local data

### Vault Management

- [ ] User can create vault
- [ ] User can view list of vaults
- [ ] User can update vault details
- [ ] User can delete vault (with confirmation)
- [ ] Deleting vault shows confirmation dialog
- [ ] Empty state shows when no vaults exist
- [ ] Pull-to-refresh works on vault list

### Item Management

- [ ] User can create password item
- [ ] Password is encrypted before sending to server
- [ ] User can view item (decryption works)
- [ ] Password is hidden by default
- [ ] User can reveal password with eye icon
- [ ] User can copy username to clipboard
- [ ] User can copy password to clipboard
- [ ] Clipboard auto-clears after 60 seconds
- [ ] Password generator works
- [ ] User can toggle favorite status
- [ ] User can delete item (with confirmation)
- [ ] Empty state shows when vault is empty

### Security Features

- [ ] App locks when sent to background
- [ ] Encryption key is cleared on lock
- [ ] User can unlock with master password
- [ ] Unlock fails with wrong password
- [ ] Biometric unlock can be enabled
- [ ] Biometric unlock prompts for authentication
- [ ] Biometric unlock still requires master password once
- [ ] Settings screen shows user info
- [ ] Settings screen shows device info

## ✅ UI/UX

- [ ] All buttons have loading states
- [ ] All API calls show loading indicators
- [ ] All errors display user-friendly messages
- [ ] All forms have validation
- [ ] All required fields are marked
- [ ] All empty states have helpful messages
- [ ] All destructive actions have confirmations
- [ ] All screens are responsive
- [ ] Navigation works correctly
- [ ] Back button works on all screens
- [ ] No UI flickering or jumps

## ✅ Error Handling

- [ ] Network errors are handled gracefully
- [ ] API errors show user-friendly messages
- [ ] Validation errors are clear
- [ ] Decryption errors are handled
- [ ] Token refresh errors trigger logout
- [ ] All async operations have try-catch
- [ ] Error boundaries implemented (if needed)

## ✅ Configuration

- [ ] API endpoints are correct (production URLs)
- [ ] App name is correct in `app.json`
- [ ] Bundle identifier is unique (iOS)
- [ ] Package name is unique (Android)
- [ ] App version is set correctly
- [ ] App icon is added to `assets/`
- [ ] Splash screen is added to `assets/`
- [ ] Environment variables configured (if using)

## ✅ Performance

- [ ] App loads in < 3 seconds
- [ ] No memory leaks detected
- [ ] Images are optimized
- [ ] No unnecessary re-renders
- [ ] Large lists use FlatList (not ScrollView)
- [ ] Decryption cache is working

## ✅ Documentation

- [ ] README.md is complete
- [ ] SECURITY.md is reviewed
- [ ] QUICKSTART.md is tested
- [ ] Code comments are added for complex logic
- [ ] API integration is documented
- [ ] Crypto implementation is documented

## ✅ Testing on Devices

### iOS Testing
- [ ] Tested on iOS simulator
- [ ] Tested on physical iPhone
- [ ] Face ID works (if available)
- [ ] Touch ID works (if available)
- [ ] App icon displays correctly
- [ ] Splash screen displays correctly
- [ ] Keyboard behavior is correct

### Android Testing
- [ ] Tested on Android emulator
- [ ] Tested on physical Android device
- [ ] Fingerprint works (if available)
- [ ] App icon displays correctly
- [ ] Splash screen displays correctly
- [ ] Back button behavior is correct

## ✅ App Store Preparation

### iOS App Store

- [ ] Apple Developer account is active
- [ ] App bundle identifier is registered
- [ ] Provisioning profiles created
- [ ] App icons meet Apple guidelines (1024x1024)
- [ ] Screenshots prepared (all required sizes)
- [ ] App description written
- [ ] Privacy policy URL added
- [ ] Support URL added
- [ ] App rating selected
- [ ] Build uploaded via Xcode or EAS

### Google Play Store

- [ ] Google Play Developer account is active
- [ ] App package name is registered
- [ ] Signing key generated
- [ ] App icons meet Google guidelines
- [ ] Screenshots prepared (phone, tablet)
- [ ] Feature graphic created
- [ ] App description written
- [ ] Privacy policy URL added
- [ ] Content rating completed
- [ ] AAB uploaded

## ✅ Legal & Compliance

- [ ] Privacy policy created
- [ ] Terms of service created
- [ ] GDPR compliance reviewed (if applicable)
- [ ] Data retention policy defined
- [ ] User data deletion process implemented

## ✅ Post-Launch

- [ ] Analytics integrated (optional)
- [ ] Crash reporting setup (Sentry, Bugsnag, etc.)
- [ ] Push notifications configured (if needed)
- [ ] App Store Optimization (ASO) completed
- [ ] Support email/contact set up
- [ ] Monitoring and alerts configured

## ✅ Security Best Practices

### Code Review Checklist

```bash
# Search for potential security issues

# Check for master password leaks
grep -r "masterPassword" src/ | grep -i log

# Check for encryption key persistence
grep -r "SecureStore.setItemAsync.*encryptionKey" src/

# Check for plaintext password logs
grep -r "console.log.*password" src/

# Check for sensitive data logs
grep -r "console.log" src/ | grep -i "password\|token\|key"
```

### Manual Security Tests

- [ ] Inspect network traffic (no plaintext passwords)
- [ ] Check local storage (no encryption keys)
- [ ] Test with debugger (keys not accessible)
- [ ] Test app lock/unlock multiple times
- [ ] Test logout clears all data
- [ ] Test decryption with wrong password fails
- [ ] Test clipboard clears after timeout

---

## 🎯 Final Checklist

Before submitting to app stores:

- [ ] All items above are checked ✅
- [ ] App tested on multiple devices
- [ ] Beta testing completed (TestFlight/Internal Testing)
- [ ] Bug fixes deployed
- [ ] Version number updated
- [ ] Release notes written
- [ ] Marketing materials prepared

---

## ✅ Ready to Launch!

Once all items are checked:

```bash
# Build production version
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

**Good luck! 🚀**
