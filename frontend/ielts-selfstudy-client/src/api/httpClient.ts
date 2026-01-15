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
  timeout: 15000, // Increased timeout
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
      });
    }

    // Handle 401 Unauthorized - Token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
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

          // Redirect to login if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        }
      }
    }

    // Handle other error statuses
    if (error.response?.status === 403) {
      // Forbidden - redirect to unauthorized page
      if (window.location.pathname !== '/unauthorized') {
        window.location.href = '/unauthorized';
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