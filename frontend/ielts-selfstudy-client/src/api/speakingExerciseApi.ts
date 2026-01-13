import httpClient from "./httpClient";

export interface SpeakingExerciseDto {
  id: number;
  title: string;
  description?: string | null;
  part: string;
  question: string;
  topic?: string | null;
  level: string;
  tips?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSpeakingExerciseRequest {
  title: string;
  description?: string | null;
  part: string;
  question: string;
  topic?: string | null;
  level: string;
  tips?: string | null;
}

export interface UpdateSpeakingExerciseRequest {
  title: string;
  description?: string | null;
  part: string;
  question: string;
  topic?: string | null;
  level: string;
  tips?: string | null;
  isActive: boolean;
}

export async function getSpeakingExercises(): Promise<SpeakingExerciseDto[]> {
  const res = await httpClient.get<SpeakingExerciseDto[]>("/speakingexercises");
  return res.data;
}

export async function getSpeakingExerciseById(id: number): Promise<SpeakingExerciseDto> {
  const res = await httpClient.get<SpeakingExerciseDto>(`/speakingexercises/${id}`);
  return res.data;
}

// Evaluate
export interface EvaluateSpeakingRequest {
  userId: number;
  answerText: string;
  targetBand?: number;
}
export interface EvaluateSpeakingResponse {
  attemptId: number;
  score?: number | null;
  maxScore?: number | null;
  feedback?: string | null;
}

export async function evaluateSpeaking(
  speakingExerciseId: number,
  payload: EvaluateSpeakingRequest
): Promise<EvaluateSpeakingResponse> {
  const res = await httpClient.post<EvaluateSpeakingResponse>(
    `/speakingexercises/${speakingExerciseId}/evaluate`,
    payload
  );
  return res.data;
}

export async function createSpeakingExercise(request: CreateSpeakingExerciseRequest): Promise<SpeakingExerciseDto> {
  const res = await httpClient.post<SpeakingExerciseDto>("/speakingexercises", request);
  return res.data;
}

export async function updateSpeakingExercise(id: number, request: UpdateSpeakingExerciseRequest): Promise<SpeakingExerciseDto> {
  const res = await httpClient.put<SpeakingExerciseDto>(`/speakingexercises/${id}`, request);
  return res.data;
}

export async function deleteSpeakingExercise(id: number): Promise<void> {
  await httpClient.delete(`/speakingexercises/${id}`);
}
