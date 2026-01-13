import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { login, register, refreshToken, revokeToken, type AuthResponse, type UserInfo } from '../api/authApi';
import httpClient from '../api/httpClient';

// Helper function to decode JWT token
function decodeUserFromToken(token: string): UserInfo | null {
  try {
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));

    // Try different claim names for role (support both short and long URI names)
    const role = decodedPayload.role ||
                 decodedPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                 decodedPayload.Role;

    return {
      id: parseInt(decodedPayload.sub || decodedPayload.nameid),
      email: decodedPayload.email || decodedPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      fullName: decodedPayload.unique_name || decodedPayload.name || decodedPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      role: role,
      targetBand: decodedPayload.targetBand || null
    };
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

interface AuthState {
  // State
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Helpers
  isAdmin: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, fullName: string, password: string, role?: string, targetBand?: number) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  validateToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      get isAdmin() {
        return get().user?.role === 'Admin';
      },

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await login({ email, password });
          const user = decodeUserFromToken(response.accessToken);

          set({
            user: user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Manually save to localStorage as backup
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);

        } catch (error) {
          const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Login failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      register: async (email: string, fullName: string, password: string, role?: string, targetBand?: number) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await register({
            email,
            fullName,
            password,
            role,
            targetBand
          });
          const user = decodeUserFromToken(response.accessToken);

          set({
            user: user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Registration failed';
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
        }
      },

      clearError: () => set({ error: null }),

      validateToken: async () => {
        const token = get().accessToken;
        if (!token) return false;

        try {
          // Make a simple request to validate token
          await httpClient.get('/auth/validate');
          return true;
        } catch {
          return false;
        }
      },

      refreshAccessToken: async () => {
        const currentRefreshToken = get().refreshToken;
        if (!currentRefreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await refreshToken({ refreshToken: currentRefreshToken });
          const user = decodeUserFromToken(response.accessToken);

          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            user: user,
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
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (accessToken && refreshToken) {
          // Decode user info from token
          const user = decodeUserFromToken(accessToken);
          set({ accessToken, refreshToken, user });

          // Validate token
          const isValid = await get().validateToken();

          if (isValid) {
            set({ isAuthenticated: true });
          } else {
            // Token invalid, try refresh
            try {
              await get().refreshAccessToken();
            } catch {
              // Refresh failed, clear everything
              set({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
              });
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
            }
          }
        }
      },
    }),
    {
      name: 'ielts-auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);