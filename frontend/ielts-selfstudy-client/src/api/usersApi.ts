import httpClient from "./httpClient";
import type { PagedRequest, PagedResponse } from "../types/common";
import type { AdminUser, CreateUserRequest, UpdateUserRequest } from "../types/user";

// Re-export types for convenience
export type { AdminUser as UserDto, CreateUserRequest, UpdateUserRequest };

// API functions
export async function getUsers(request?: PagedRequest): Promise<PagedResponse<AdminUser>> {
  const params = request ? new URLSearchParams({
    pageNumber: request.pageNumber.toString(),
    pageSize: request.pageSize.toString(),
    ...(request.search && { search: request.search }),
    ...(request.sortBy && { sortBy: request.sortBy }),
    ...(request.sortDirection && { sortDirection: request.sortDirection }),
  }) : undefined;

  const url = params ? `/users?${params.toString()}` : '/users';
  const res = await httpClient.get<PagedResponse<AdminUser>>(url);
  return res.data;
}

export async function getUserById(id: number): Promise<AdminUser> {
  const res = await httpClient.get<AdminUser>(`/users/${id}`);
  return res.data;
}

export async function createUser(request: CreateUserRequest): Promise<AdminUser> {
  const res = await httpClient.post<AdminUser>('/users', request);
  return res.data;
}

export async function updateUser(id: number, request: UpdateUserRequest): Promise<AdminUser> {
  const res = await httpClient.put<AdminUser>(`/users/${id}`, request);
  return res.data;
}

export async function deleteUser(id: number): Promise<void> {
  await httpClient.delete(`/users/${id}`);
}

export async function deleteUsers(ids: number[]): Promise<void> {
  // For now, delete one by one. In a real API, you'd have a bulk delete endpoint
  await Promise.all(ids.map(id => deleteUser(id)));
}

// Utility function to get all users (for backward compatibility)
export async function getAllUsers(): Promise<AdminUser[]> {
  const res = await httpClient.get<AdminUser[]>('/users');
  return res.data;
}