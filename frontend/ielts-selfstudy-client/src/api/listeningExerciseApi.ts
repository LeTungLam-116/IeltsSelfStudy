import httpClient from "./httpClient";

export interface ListeningExerciseDto {
  id: number;
  title: string;
  description?: string | null;
  audioUrl: string;
  transcript?: string | null;
  level: string;
  questionCount: number;
  durationSeconds?: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateListeningExerciseRequest {
  title: string;
  description?: string | null;
  audioUrl: string;
  transcript?: string | null;
  level: string;
  questionCount: number;
  durationSeconds?: number | null;
}

export interface UpdateListeningExerciseRequest {
  title: string;
  description?: string | null;
  audioUrl: string;
  transcript?: string | null;
  level: string;
  questionCount: number;
  durationSeconds?: number | null;
  isActive: boolean;
}

export async function getListeningExercises(): Promise<ListeningExerciseDto[]> {
  const res = await httpClient.get<ListeningExerciseDto[]>("/listeningexercises");
  return res.data;
}

export async function getListeningExerciseById(
  id: number
): Promise<ListeningExerciseDto> {
  const res = await httpClient.get<ListeningExerciseDto>(
    `/listeningexercises/${id}`
  );
  return res.data;
}

export async function createListeningExercise(request: CreateListeningExerciseRequest): Promise<ListeningExerciseDto> {
  const res = await httpClient.post<ListeningExerciseDto>("/listeningexercises", request);
  return res.data;
}

export async function updateListeningExercise(id: number, request: UpdateListeningExerciseRequest): Promise<ListeningExerciseDto> {
  const res = await httpClient.put<ListeningExerciseDto>(`/listeningexercises/${id}`, request);
  return res.data;
}

export async function deleteListeningExercise(id: number): Promise<void> {
  await httpClient.delete(`/listeningexercises/${id}`);
}
