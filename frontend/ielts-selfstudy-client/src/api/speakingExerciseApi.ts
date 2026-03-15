import httpClient from "./httpClient";

export interface SpeakingExerciseDto {
  id: number;
  title: string;
  description?: string | null;
  part: string;
  question: string;
  topic?: string | null;
  cueCardJson?: string | null;
  level: string;
  tips?: string | null;
  isActive: boolean;
  createdAt: string;
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
  userText?: string;
}

export async function evaluateSpeaking(
  speakingExerciseId: number,
  payload: EvaluateSpeakingRequest
): Promise<EvaluateSpeakingResponse> {
  const res = await httpClient.post<EvaluateSpeakingResponse>(
    `/speakingexercises/${speakingExerciseId}/evaluate`,
    payload,
    { timeout: 60000 }
  );
  return res.data;
}

export async function evaluateSpeakingAudio(
  speakingExerciseId: number,
  audioFile: Blob,
  targetBand?: number,
  fileName: string = "recording.webm"
): Promise<EvaluateSpeakingResponse> {
  const formData = new FormData();
  formData.append('audio', audioFile, fileName);
  if (targetBand) {
    formData.append('targetBand', targetBand.toString());
  }

  const res = await httpClient.post<EvaluateSpeakingResponse>(
    `/speakingexercises/${speakingExerciseId}/evaluate-audio`,
    formData,
    {
      timeout: 120000, // 2 minutes for audio transcription + grading
    }
  );
  return res.data;
}
