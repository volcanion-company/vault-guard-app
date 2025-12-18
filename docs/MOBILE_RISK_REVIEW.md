# Mobile Bug & Risk Review

Scope: React Native (Expo) mobile app on iOS & Android. Focus: runtime stability, crypto correctness, auth/session handling, and platform compatibility.

## Critical (blocking release)
- WebCrypto/AES usage will crash on device: `crypto.subtle` and `crypto.getRandomValues` are not available in React Native by default (Hermes/JSI). Files: src/crypto/key-derivation.ts, src/crypto/aes-gcm.ts. At runtime, `crypto` is undefined → encryption, login, register, unlock all fail. Needs a supported crypto library (e.g., `react-native-get-random-values` + `@peculiar/webcrypto` or native module) or Expo-provided API.
- Base64 helpers rely on `atob`/`btoa`, which are not provided in React Native; will throw ReferenceError on both platforms. A polyfill (e.g., `base-64`) is required.
- Tokens not persisted to SecureStore on login/register: auth store sets `accessToken/refreshToken` only in memory; SecureStore is never written. After app restart, `loadSession` finds nothing; auto-login fails. Also API interceptors fetch tokens from SecureStore, so they send no Authorization header until a refresh flow happens.
- Token key mismatch/incomplete storage flow: interceptors use `ENV.STORAGE_KEYS.*`; auth store uses hardcoded strings and never calls `saveTokens`/`clearTokens` from src/services/api.ts. Results: refresh flow writes to SecureStore, but primary login does not; session state and storage are inconsistent between layers.

## High
- Unlock flow does not verify the master password: `unlockApp` re-derives a key but never validates it by decrypting a known ciphertext. Users can proceed with a wrong password and hit decryption failures later. Add a lightweight verification (e.g., decrypt a sentinel item) to fail fast.
- Error handling for decryption: detail screen shows “Failed to decrypt item” without a path to re-unlock; better to prompt to re-derive key or navigate to unlock.
- Password generator uses `Math.random` (not cryptographically secure). For a security product, use a CSPRNG (once crypto is fixed).
- No concurrency guard on token refresh: multiple parallel 401s can trigger multiple refresh calls and race. Consider a refresh mutex/queue.

## Medium
- Biometric toggle only stores a flag; unlock flow does not integrate biometric to retrieve/derive the key. Users must retype the master password even when biometric is enabled (UX gap; not a security bug).
- Clipboard auto-clear uses `setTimeout` without cleanup; if the component unmounts, timer persists. Low impact but could be cleaned up via a managed timer.
- App lock state relies solely on `encryptionKey` presence; if the key is ever left in memory after backgrounding/crash, data could remain readable in-memory. Consider AppState listeners to clear key on background.

## Platform Compatibility Notes
- iOS/Android: WebCrypto and `atob`/`btoa` are not available out of the box → current builds will throw before first encryption call.
- Hermes: same limitations; must ship polyfills or native crypto.
- Expo Go vs. standalone: even in Expo Go, `crypto.subtle` is absent; need an alternate implementation.

## Recommended Fix Plan (priority order)
1) Replace WebCrypto dependencies with RN-compatible crypto:
   - Add `react-native-get-random-values` and `@peculiar/webcrypto` (or another vetted AES-GCM + PBKDF2-SHA256 implementation) and polyfill before app code runs.
   - Replace `atob`/`btoa` with `base-64` helpers and import them where used.
2) Unify token storage flow:
   - On login/register, persist tokens to SecureStore using `ENV.STORAGE_KEYS` and keep store state in sync.
   - Use the same helpers (`saveTokens/clearTokens`) everywhere; ensure logout deletes stored tokens.
3) Add master-password verification on unlock:
   - Store or fetch a small encrypted sentinel per user; decrypt it during unlock to validate the key.
4) Harden refresh logic:
   - Add a single-flight refresh mutex and replay queued requests.
5) Improve UX/safety:
   - Integrate biometric unlock with the master-password flow (still requires password-derived key, but can pre-fill an encrypted secret).
   - Switch password generator to a CSPRNG once crypto is fixed.
   - Optionally clear encryption key on AppState background.

## Testing Checklist (post-fix)
- iOS + Android physical devices and simulators/emulators
- Login/register/unlock flows succeed (tokens persisted; key derived)
- Create/view/delete items: encryption/decryption works; no crashes
- App restart: auto-login (tokens) + required unlock (key) works
- Token refresh: single refresh for concurrent 401s; retries succeed
- Biometric toggle: flag saved; unlock flow prompt behaves as designed
- Clipboard: copy & auto-clear after 60s
- Performance: encryption/decryption latency acceptable (<500ms per op)
