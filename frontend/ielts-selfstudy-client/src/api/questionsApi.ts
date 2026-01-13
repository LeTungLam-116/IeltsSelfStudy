import httpClient from "./httpClient";

export interface QuestionDto {
  id: number;
  skill: string;
  exerciseId: number;
  questionNumber: number;
  questionText: string;
  questionType: string;
  correctAnswer: string;
  points: number;
  optionsJson?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateQuestionRequest {
  skill: string;
  exerciseId: number;
  questionNumber: number;
  questionText: string;
  questionType: string;
  correctAnswer: string;
  points: number;
  optionsJson?: string | null;
}

export interface UpdateQuestionRequest {
  skill: string;
  exerciseId: number;
  questionNumber: number;
  questionText: string;
  questionType: string;
  correctAnswer: string;
  points: number;
  optionsJson?: string | null;
  isActive: boolean;
}

export async function getQuestions(): Promise<QuestionDto[]> {
  const res = await httpClient.get<QuestionDto[]>("/questions");
  return res.data;
}

export async function getQuestionsByExercise(exerciseId: number): Promise<QuestionDto[]> {
  const res = await httpClient.get<QuestionDto[]>(`/questions/exercise/${exerciseId}`);
  return res.data;
}

export async function getQuestionById(id: number): Promise<QuestionDto> {
  const res = await httpClient.get<QuestionDto>(`/questions/${id}`);
  return res.data;
}

export async function createQuestion(request: CreateQuestionRequest): Promise<QuestionDto> {
  const res = await httpClient.post<QuestionDto>("/questions", request);
  return res.data;
}

export async function updateQuestion(id: number, request: UpdateQuestionRequest): Promise<QuestionDto> {
  const res = await httpClient.put<QuestionDto>(`/questions/${id}`, request);
  return res.data;
}

export async function deleteQuestion(id: number): Promise<void> {
  await httpClient.delete(`/questions/${id}`);
}
