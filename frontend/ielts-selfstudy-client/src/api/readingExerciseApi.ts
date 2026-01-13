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

export interface CreateReadingExerciseRequest {
  title: string;
  description?: string | null;
  passageText: string;
  level: string;
  questionCount: number;
}

export interface UpdateReadingExerciseRequest {
  title: string;
  description?: string | null;
  passageText: string;
  level: string;
  questionCount: number;
  isActive: boolean;
}

export async function getReadingExercises(): Promise<ReadingExerciseDto[]> {
  const res = await httpClient.get<ReadingExerciseDto[]>("/readingexercises");
  return res.data;
}

export async function getReadingExerciseById(id: number): Promise<ReadingExerciseDto> {
  const res = await httpClient.get<ReadingExerciseDto>(`/readingexercises/${id}`);
  return res.data;
}

export async function createReadingExercise(request: CreateReadingExerciseRequest): Promise<ReadingExerciseDto> {
  const res = await httpClient.post<ReadingExerciseDto>("/readingexercises", request);
  return res.data;
}

export async function updateReadingExercise(id: number, request: UpdateReadingExerciseRequest): Promise<ReadingExerciseDto> {
  const res = await httpClient.put<ReadingExerciseDto>(`/readingexercises/${id}`, request);
  return res.data;
}

export async function deleteReadingExercise(id: number): Promise<void> {
  await httpClient.delete(`/readingexercises/${id}`);
}
