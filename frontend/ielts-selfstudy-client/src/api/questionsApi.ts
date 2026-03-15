import httpClient from './httpClient';
import type {
  QuestionDto,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  QuestionFilters
} from '../types/questions';
import type { PagedResponse } from '../types/common';

// API functions for questions management

export async function getQuestions(filters?: QuestionFilters & { pageNumber?: number; pageSize?: number }): Promise<PagedResponse<QuestionDto>> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.exerciseId !== undefined && filters.exerciseId !== 0) {
      params.append('exerciseId', filters.exerciseId.toString());
    }
    if (filters.skill) {
      params.append('skill', filters.skill);
    }
    if (filters.questionType) {
      params.append('questionType', filters.questionType);
    }
    if (filters.isActive !== undefined) {
      params.append('isActive', filters.isActive.toString());
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.pageNumber) {
      params.append('pageNumber', filters.pageNumber.toString());
    }
    if (filters.pageSize) {
      params.append('pageSize', filters.pageSize.toString());
    }
  }

  const url = params.toString() ? `/questions?${params.toString()}` : '/questions';
  const res = await httpClient.get(url);
  const data = res.data;

  // Normalize: if backend returns a plain array, wrap into PagedResponse shape
  if (Array.isArray(data)) {
    return {
      items: data as QuestionDto[],
      pageNumber: 1,
      pageSize: data.length || 10,
      totalCount: data.length || 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  return data as PagedResponse<QuestionDto>;
}

export async function getQuestionsByExercise(exerciseId: number): Promise<QuestionDto[]> {
  const res = await httpClient.get<QuestionDto[]>(`/questions/exercise?exerciseId=${exerciseId}`);
  return res.data;
}

export async function getQuestionById(id: number): Promise<QuestionDto> {
  const res = await httpClient.get<QuestionDto>(`/questions/${id}`);
  return res.data;
}

export async function createQuestion(request: CreateQuestionRequest): Promise<QuestionDto> {
  const res = await httpClient.post<QuestionDto>('/questions', request);
  return res.data;
}

export async function importQuestionsFromExcel(exerciseId: number, file: File): Promise<{ message: string, count?: number }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await httpClient.post<{ message: string, count?: number }>(`/exercises/${exerciseId}/import-questions`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function previewImportExcel(exerciseId: number, file: File): Promise<any[]> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await httpClient.post<any[]>(`/questions/import/preview/${exerciseId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function confirmImportExcel(request: any): Promise<{ message: string, count?: number }> {
  const res = await httpClient.post<{ message: string, count?: number }>(`/questions/import/confirm`, request);
  return res.data;
}

export async function updateQuestion(id: number, request: UpdateQuestionRequest): Promise<QuestionDto> {
  const res = await httpClient.put<QuestionDto>(`/questions/${id}`, request);
  return res.data;
}

export async function deleteQuestion(id: number): Promise<void> {
  await httpClient.delete(`/questions/${id}`);
}
