import httpClient from "./httpClient";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
  role?: string;
  targetBand?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: UserInfo;
}

export interface UserInfo {
  id: number;
  email: string;
  fullName: string;
  role: string;
  targetBand: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export async function login(loginData: LoginRequest): Promise<AuthResponse> {
  const response = await httpClient.post<AuthResponse>("/auth/login", loginData);
  return response.data;
}

export async function register(registerData: RegisterRequest): Promise<AuthResponse> {
  const response = await httpClient.post<AuthResponse>("/auth/register", registerData);
  return response.data;
}

export async function refreshToken(refreshData: RefreshTokenRequest): Promise<AuthResponse> {
  const response = await httpClient.post<AuthResponse>("/auth/refresh", refreshData);
  return response.data;
}

export async function revokeToken(refreshToken: string): Promise<void> {
  await httpClient.post("/auth/revoke", { refreshToken });
}