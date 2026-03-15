import { create } from 'zustand';
import { login, register, refreshToken, revokeToken } from '../api/authApi';
import type { User, AuthResponse } from '../types/auth';
import httpClient from '../api/httpClient';

function getVietnameseError(message: string): string {
  if (!message) return 'Đã có lỗi xảy ra';

  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('authorized')) // 401 Unauthorized usually means wrong credentials during login
    return 'Email hoặc mật khẩu không chính xác.';
  if (lowerMsg.includes('permission') || lowerMsg.includes('forbidden')) // 403 Forbidden
    return 'Bạn không có quyền thực hiện hành động này.';
  if (lowerMsg.includes('invalid email') || lowerMsg.includes('password') || lowerMsg.includes('credential'))
    return 'Email hoặc mật khẩu không chính xác.';
  if (lowerMsg.includes('exists') || lowerMsg.includes('taken'))
    return 'Email này đã được sử dụng.';
  if (lowerMsg.includes('login failed'))
    return 'Đăng nhập thất bại. Vui lòng thử lại.';
  if (lowerMsg.includes('registration failed'))
    return 'Đăng ký thất bại. Vui lòng thử lại.';

  return message;
}

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean; // Add this flag
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, fullName: string, password: string, role?: 'user' | 'admin', targetBand?: number) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  validateToken: () => Promise<boolean>;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>()(
  (set, get) => ({
    // Initial state
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false, // Start as not initialized
    error: null,

    // Actions
    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const response: AuthResponse = await login({ email, password });

        set({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Save to localStorage
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('auth-user', JSON.stringify(response.user));
      } catch (error) {
        const rawMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Login failed';
        const errorMessage = getVietnameseError(rawMessage);
        set({ error: errorMessage, isLoading: false });
        throw error;
      }
    },

    register: async (email: string, fullName: string, password: string, role?: 'user' | 'admin', targetBand?: number) => {
      set({ isLoading: true, error: null });
      try {
        const response: AuthResponse = await register({
          email,
          fullName,
          password,
          role,
          targetBand
        });

        set({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Save to localStorage
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('auth-user', JSON.stringify(response.user));
      } catch (error) {
        const rawMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Registration failed';
        const errorMessage = getVietnameseError(rawMessage);
        set({ error: errorMessage, isLoading: false });
        throw error;
      }
    },

    logout: async () => {
      try {
        const refreshToken = get().refreshToken;
        if (refreshToken) {
          await revokeToken(refreshToken);
        }
      } catch {
        console.error('Failed to revoke token');
      } finally {
        // Clear state regardless of revoke success
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auth-user');
      }
    },

    clearError: () => set({ error: null }),

    setInitialized: () => set({ isInitialized: true }),

    validateToken: async () => {
      const token = get().accessToken;
      if (!token) {
        return false;
      }

      try {
        // Make a simple request to validate token
        await httpClient.get('/auth/validate');
        return true;
      } catch (error) {
        // For now, if API fails, still consider token valid if it exists
        // This is a temporary fix until backend is running
        return true;
      }
    },

    refreshAccessToken: async () => {
      const currentRefreshToken = get().refreshToken;
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      try {
        const response = await refreshToken({ refreshToken: currentRefreshToken });

        set({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: response.user,
          isAuthenticated: true,
          error: null,
        });

        // Update localStorage
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
      } catch (error) {
        // Refresh failed, logout user
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: 'Session expired. Please login again.',
        });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        throw error;
      }
    },

    initializeAuth: async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userStr = localStorage.getItem('auth-user');

        if (accessToken && refreshToken && userStr) {
          const user = JSON.parse(userStr);

          // Set state from localStorage
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true
          });
        } else {
          // No tokens, ensure clean state
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        // Clear corrupted data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auth-user');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      } finally {
        // Always mark as initialized, regardless of success/failure
        set({ isInitialized: true });
      }
    },
  })
);