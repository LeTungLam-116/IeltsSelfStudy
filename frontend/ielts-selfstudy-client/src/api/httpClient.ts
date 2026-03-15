import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import type { AuthResponse } from "../types/auth";

// Define types for interceptors
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Environment-based configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://localhost:7295/api";
const isDevelopment = import.meta.env.DEV;

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s timeout for AI operations
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token and logging
httpClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }

    // Log requests in development
    if (isDevelopment) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        headers: config.headers,
      });
    }

    return config;
  },
  (error) => {
    if (isDevelopment) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh and errors
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log responses in development
    if (isDevelopment) {
      console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        data: response.data,
        status: response.status,
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Log errors in development
    if (isDevelopment) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        method: originalRequest?.method?.toUpperCase(),
        url: originalRequest?.url,
        data: error.response?.data,
        message: error.message,
        responseBody: error.response?.data,
      });
      if (error.response?.status === 400) {
        console.error('❌ 400 Bad Request body:', JSON.stringify(error.response?.data));
      }
    }

    // Handle 401 Unauthorized - Token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't attempt to refresh if we're already trying to login/refresh
      if (originalRequest.url?.includes('/login') || originalRequest.url?.includes('/refresh')) {
        return Promise.reject(error);
      }

      // Don't retry FormData requests (file streams can't be re-read after consumption)
      if (originalRequest.data instanceof FormData) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await httpClient.post<AuthResponse>('/auth/refresh', {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

          // Update stored tokens
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Update authorization header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          // Retry the original request
          return httpClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('auth-user');

          // Redirect to login if not already there (avoid reload loop)
          const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, '');
          if (currentPath !== '/login') {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        }
      }
    }

    // Handle other error statuses
    if (error.response?.status === 403) {
      // Forbidden - redirect to unauthorized page
      // Exception: If we are trying to login, show error inline, don't redirect
      if (!originalRequest.url?.includes('/login')) {
        if (window.location.pathname !== '/unauthorized') {
          window.location.href = '/unauthorized';
        }
      }
    }

    if (error.response?.status >= 500) {
      // Server errors - could show a toast or global error message
      console.error('Server error occurred');
    }

    return Promise.reject(error);
  }
);

export default httpClient;