import httpClient from "./httpClient";
import type { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenRequest } from "../types/auth";

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