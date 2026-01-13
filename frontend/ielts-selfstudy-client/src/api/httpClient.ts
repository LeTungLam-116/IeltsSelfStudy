import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { type AuthResponse } from "./authApi";

// Define types for interceptors
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const httpClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'https://localhost:7295'}/api`,
  timeout: 10000,
  withCredentials: false,
});

// Request interceptor - Add auth token
httpClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    
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
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default httpClient;