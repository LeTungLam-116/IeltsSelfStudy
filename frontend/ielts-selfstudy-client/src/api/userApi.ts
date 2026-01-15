import httpClient from "./httpClient";

export interface UserDto {
  id: number;
  email: string;
  fullName: string;
  role: string;
  targetBand?: number | null;
  isActive: boolean;
  createdAt: string;
}

export async function getUsers(): Promise<UserDto[]> {
  const res = await httpClient.get<UserDto[]>("/users");
  return res.data;
}

export async function deleteUser(id: number): Promise<void> {
  await httpClient.delete(`/users/${id}`);
}

// update rất đơn giản
export async function updateUser(
  id: number,
  payload: { fullName: string; role: string; targetBand?: number | null; isActive: boolean }
): Promise<UserDto> {
  const res = await httpClient.put<UserDto>(`/users/${id}`, payload);
  return res.data;
}
