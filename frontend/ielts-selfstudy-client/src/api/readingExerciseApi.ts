import httpClient from "./httpClient";

export interface ReadingExerciseDto {
  id: number;
  title: string;
  description?: string | null;
  passageText: string;
  level: string;
  questionCount: number;
  isActive: boolean;
  createdAt: string;
}

export async function getReadingExercises(): Promise<ReadingExerciseDto[]> {
  const res = await httpClient.get<ReadingExerciseDto[]>("/readingexercises");
  return res.data;
}

export async function getReadingExerciseById(
  id: number
): Promise<ReadingExerciseDto> {
  const res = await httpClient.get<ReadingExerciseDto>(
    `/readingexercises/${id}`
  );
  return res.data;
}

// Evaluate
export interface EvaluateReadingRequest {
  userId: number;
  answerText: string;
  targetBand?: number;
}
export interface EvaluateReadingResponse {
  attemptId: number;
  score?: number | null;
  maxScore?: number | null;
  feedback?: string | null;
}

export async function evaluateReading(
  readingExerciseId: number,
  payload: EvaluateReadingRequest
): Promise<EvaluateReadingResponse> {
  const res = await httpClient.post<EvaluateReadingResponse>(
    `/readingexercises/${readingExerciseId}/evaluate`,
    payload
  );
  return res.data;
}