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
