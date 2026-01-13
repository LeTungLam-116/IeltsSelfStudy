import httpClient from "./httpClient";

export interface WritingExerciseDto {
  id: number;
  title: string;
  description?: string | null;
  taskType: string;
  question: string;
  topic?: string | null;
  level: string;
  minWordCount: number;
  sampleAnswer?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateWritingExerciseRequest {
  title: string;
  description?: string | null;
  taskType: string;
  question: string;
  topic?: string | null;
  level: string;
  minWordCount: number;
  sampleAnswer?: string | null;
}

export interface UpdateWritingExerciseRequest {
  title: string;
  description?: string | null;
  taskType: string;
  question: string;
  topic?: string | null;
  level: string;
  minWordCount: number;
  sampleAnswer?: string | null;
  isActive: boolean;
}

export async function getWritingExercises(): Promise<WritingExerciseDto[]> {
  const res = await httpClient.get<WritingExerciseDto[]>("/writingexercises");
  return res.data;
}

export async function getWritingExerciseById(
  id: number
): Promise<WritingExerciseDto> {
  const res = await httpClient.get<WritingExerciseDto>(
    `/writingexercises/${id}`
  );
  return res.data;
}
export interface EvaluateWritingRequest {
  userId: number;
  essayText: string;
  targetBand?: number;
}

export interface EvaluateWritingResponse {
  attemptId: number;
  score?: number | null;
  maxScore?: number | null;
  feedback?: string | null;
}

export async function evaluateWriting(
  writingExerciseId: number,
  payload: EvaluateWritingRequest
): Promise<EvaluateWritingResponse> {
  const res = await httpClient.post<EvaluateWritingResponse>(
    `/writingexercises/${writingExerciseId}/evaluate`,
    payload
  );
  return res.data;
}

export async function createWritingExercise(request: CreateWritingExerciseRequest): Promise<WritingExerciseDto> {
  const res = await httpClient.post<WritingExerciseDto>("/writingexercises", request);
  return res.data;
}

export async function updateWritingExercise(id: number, request: UpdateWritingExerciseRequest): Promise<WritingExerciseDto> {
  const res = await httpClient.put<WritingExerciseDto>(`/writingexercises/${id}`, request);
  return res.data;
}

export async function deleteWritingExercise(id: number): Promise<void> {
  await httpClient.delete(`/writingexercises/${id}`);
}
