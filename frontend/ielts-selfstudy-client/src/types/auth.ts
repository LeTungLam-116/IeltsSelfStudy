// Authentication related types
export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  targetBand?: number | null;
  isActive?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
  role?: 'user' | 'admin';
  targetBand?: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
