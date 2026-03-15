import httpClient from "./httpClient";

export interface AttemptDto {
  id: number;
  userId: number;
  skill: string;
  exerciseId: number;
  exerciseTitle?: string;
  score?: number | null;
  maxScore?: number | null;
  userAnswerJson?: string | null;
  aiFeedback?: string | null;
  isPassed?: boolean;
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

// ✅ NEW: Lấy lịch sử attempts theo user (ID lấy từ token)
export async function getAttemptsByUser(): Promise<AttemptDto[]> {
  // Backend endpoint is /api/attempts/by-user (no ID in path)
  // But wait, the backend returns PagedResult<AttemptDto>, not AttemptDto[].
  // Let's check if the generic return type needs adjustment or if we just extract data.
  // Assuming minimal change to fix 404 first.
  const res = await httpClient.get<any>("/attempts/by-user");
  // The backend returns { items: [...], totalCount: ... } (PagedResult)
  // But the frontend expects AttemptDto[]. Let's adapt it.
  return res.data.items || [];
}

// ✅ NEW: Lấy chi tiết 1 attempt
export async function getAttemptById(id: number): Promise<AttemptDto> {
  const res = await httpClient.get<AttemptDto>(`/attempts/${id}`);
  return res.data;
}