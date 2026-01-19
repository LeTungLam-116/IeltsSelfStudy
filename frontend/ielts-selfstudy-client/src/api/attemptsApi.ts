import httpClient from './httpClient';
import type { AttemptDto, AttemptFiltersDto, PagedAttemptResponseDto, GradeAttemptRequestDto } from '../types/attempts';

export interface AttemptsFilters extends AttemptFiltersDto {
  pageNumber?: number;
  pageSize?: number;
}

export async function getAttempts(filters: AttemptsFilters = {}): Promise<PagedAttemptResponseDto> {
  const params = new URLSearchParams();

  // Add filter parameters
  if (filters.userId) params.append('UserId', filters.userId.toString());
  if (filters.skill) params.append('Skill', filters.skill);
  if (filters.exerciseId) params.append('ExerciseId', filters.exerciseId.toString());
  if (filters.courseId) params.append('CourseId', filters.courseId.toString());
  if (filters.isGraded !== undefined) params.append('IsGraded', filters.isGraded.toString());
  if (filters.isPassed !== undefined) params.append('IsPassed', filters.isPassed.toString());
  if (filters.minScore !== undefined) params.append('MinScore', filters.minScore.toString());
  if (filters.maxScore !== undefined) params.append('MaxScore', filters.maxScore.toString());
  if (filters.fromDate) params.append('FromDate', filters.fromDate.toISOString());
  if (filters.toDate) params.append('ToDate', filters.toDate.toISOString());
  if (filters.sortBy) params.append('SortBy', filters.sortBy);
  if (filters.sortDirection) params.append('SortDirection', filters.sortDirection);

  // Add pagination
  params.append('pageNumber', (filters.pageNumber || 1).toString());
  params.append('pageSize', (filters.pageSize || 10).toString());

  const response = await httpClient.get<PagedAttemptResponseDto>(`/attempts/admin/list?${params}`);
  return response.data;
}

export async function getAttemptById(id: number): Promise<AttemptDto> {
  const response = await httpClient.get<AttemptDto>(`/attempts/admin/${id}`);
  return response.data;
}

export async function gradeAttempt(id: number, gradeRequest: GradeAttemptRequestDto): Promise<AttemptDto> {
  const response = await httpClient.post<AttemptDto>(`/attempts/admin/${id}/grade`, gradeRequest);
  return response.data;
}
