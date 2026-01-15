import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAuthStore } from '../authStore'
import type { User } from '../../types'

// Mock the auth API
vi.mock('../../api/authApi', () => ({
  login: vi.fn(),
  register: vi.fn(),
  refreshToken: vi.fn(),
  revokeToken: vi.fn(),
}))

import { login } from '../../api/authApi'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('initializeAuth', () => {
    it('should set authenticated state when tokens exist in localStorage', async () => {
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'user',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z'
      }

      localStorageMock.getItem.mockImplementation((key: string) => {
        switch (key) {
          case 'accessToken':
            return 'mock-access-token'
          case 'refreshToken':
            return 'mock-refresh-token'
          case 'auth-user':
            return JSON.stringify(mockUser)
          default:
            return null
        }
      })

      const { initializeAuth } = useAuthStore.getState()
      await initializeAuth()

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.accessToken).toBe('mock-access-token')
      expect(state.refreshToken).toBe('mock-refresh-token')
      expect(state.isAuthenticated).toBe(true)
      expect(state.isInitialized).toBe(true)
    })

    it('should set clean state when no tokens exist', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      const { initializeAuth } = useAuthStore.getState()
      await initializeAuth()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isInitialized).toBe(true)
    })

    it('should handle corrupted localStorage data', async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'auth-user') return 'invalid-json'
        return 'some-token'
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { initializeAuth } = useAuthStore.getState()
      await initializeAuth()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isInitialized).toBe(true)

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth-user')

      consoleSpy.mockRestore()
    })
  })

  describe('logout', () => {
    it('should clear state and localStorage', async () => {
      // Set initial state
      useAuthStore.setState({
        user: { id: 1, email: 'test@example.com', fullName: 'Test', role: 'user' },
        accessToken: 'token',
        refreshToken: 'refresh',
        isAuthenticated: true,
      })

      const { logout } = useAuthStore.getState()
      await logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.isAuthenticated).toBe(false)

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth-user')
    })
  })

  describe('login', () => {
    it('should handle successful login', async () => {
      const mockResponse = {
        user: {
          id: 1,
          email: 'test@example.com',
          fullName: 'Test User',
          role: 'user' as const,
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        accessTokenExpiresAt: '2024-01-01T01:00:00Z',
        refreshTokenExpiresAt: '2024-01-02T00:00:00Z',
      }

      // Setup mock
      vi.mocked(login).mockResolvedValue(mockResponse)

      const { login: storeLogin } = useAuthStore.getState()
      await storeLogin('test@example.com', 'password')

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockResponse.user)
      expect(state.accessToken).toBe('access-token')
      expect(state.refreshToken).toBe('refresh-token')
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()

      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'access-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth-user', JSON.stringify(mockResponse.user))
    })

    it('should handle login error', async () => {
      const mockError = { response: { data: { message: 'Invalid credentials' } } }
      vi.mocked(login).mockRejectedValue(mockError)

      const { login: storeLogin } = useAuthStore.getState()

      await expect(storeLogin('test@example.com', 'wrong-password')).rejects.toThrow()

      const state = useAuthStore.getState()
      expect(state.error).toBe('Invalid credentials')
      expect(state.isLoading).toBe(false)
      expect(state.isAuthenticated).toBe(false)
    })
  })
})
