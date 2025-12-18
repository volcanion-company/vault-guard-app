/**
 * Entry point - Expo expects this at app root
 * 
 * CRITICAL: Import crypto polyfills FIRST before any other code
 */

// Polyfill for crypto.getRandomValues (required for React Native)
import 'react-native-get-random-values';

export { default } from './src/app/_layout';
