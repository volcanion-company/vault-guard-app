/**
 * Authentication Service
 * 
 * Handles user authentication with Auth Service:
 * - Register
 * - Login
 * - Logout
 * - Token refresh
 */

import { authClient, saveTokens, clearTokens, handleApiError } from './api';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
} from '@/types';

export class AuthService {
  /**
   * Register new user
   */
  static async register(request: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await authClient.post<AuthResponse>(
        '/api/v1/authentication/register',
        request
      );

      const authData = response.data;

      // Store tokens securely
      await saveTokens(authData.accessToken, authData.refreshToken);

      return authData;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }

  /**
   * Login user
   */
  static async login(request: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await authClient.post<AuthResponse>(
        '/api/v1/authentication/login',
        request
      );

      const authData = response.data;

      // Store tokens securely
      await saveTokens(authData.accessToken, authData.refreshToken);

      return authData;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await authClient.post('/api/v1/authentication/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local tokens
      await clearTokens();
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const response = await authClient.post<{
        accessToken: string;
        refreshToken: string;
      }>('/api/v1/authentication/refresh', {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Store new tokens
      await saveTokens(accessToken, newRefreshToken);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }
}
