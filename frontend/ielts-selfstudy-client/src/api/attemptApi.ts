import httpClient from "./httpClient";

export interface AttemptDto {
  id: number;
  userId: number;
  skill: string;
  exerciseId: number;
  score?: number | null;
  maxScore?: number | null;
  userAnswerJson?: string | null;
  aiFeedback?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateAttemptPayload {
  userId: number;
  skill: string;       // "Listening", "Reading", "Writing", "Speaking"
  exerciseId: number;
  score?: number;
  maxScore?: number;
  userAnswerJson?: string;
  aiFeedback?: string;
}

export async function createAttempt(
  payload: CreateAttemptPayload
): Promise<AttemptDto> {
  const res = await httpClient.post<AttemptDto>("/attempts", payload);
  return res.data;
}

// ✅ NEW: Lấy lịch sử attempts theo user
export async function getAttemptsByUser(userId: number): Promise<AttemptDto[]> {
  const res = await httpClient.get<AttemptDto[]>(`/attempts/by-user/${userId}`);
  return res.data;
}

// ✅ NEW: Lấy chi tiết 1 attempt
export async function getAttemptById(id: number): Promise<AttemptDto> {
  const res = await httpClient.get<AttemptDto>(`/attempts/${id}`);
  return res.data;
}