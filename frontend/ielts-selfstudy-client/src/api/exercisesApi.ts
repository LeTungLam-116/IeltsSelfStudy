import httpClient from './httpClient';
import type {
  AdminExerciseDto,
  CreateExerciseRequest,
  UpdateExerciseRequest,
  ExerciseVersion,
  ExerciseAnalytics,
  ExercisePreview,
  ExerciseFilters,
  BulkExerciseOperation,
  BulkExerciseResult,
  ExerciseExportRequest,
  ExerciseExportResult,
  ExerciseImportResult
} from '../types/exercise';
import type { PagedRequest, PagedResponse } from '../types/common';

// API functions for admin exercise management

export async function getExercises(request?: PagedRequest & ExerciseFilters): Promise<PagedResponse<AdminExerciseDto>> {
  const params = new URLSearchParams();

  if (request) {
    if (request.pageNumber) params.append('pageNumber', request.pageNumber.toString());
    if (request.pageSize) params.append('pageSize', request.pageSize.toString());
    if (request.search) params.append('search', request.search);
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortDirection) params.append('sortDirection', request.sortDirection);

    // Exercise-specific filters
    if (request.types?.length) params.append('types', request.types.join(','));
    if (request.levels?.length) params.append('levels', request.levels.join(','));
    if (request.isActive !== undefined) params.append('isActive', request.isActive.toString());
  }

  const url = params.toString() ? `/exercises?${params.toString()}` : '/exercises';
  const res = await httpClient.get<PagedResponse<AdminExerciseDto>>(url);
  return res.data;
}

export async function getExerciseById(id: number): Promise<AdminExerciseDto> {
  const res = await httpClient.get<AdminExerciseDto>(`/exercises/${id}`);
  return res.data;
}

export async function createExercise(request: CreateExerciseRequest): Promise<AdminExerciseDto> {
  const res = await httpClient.post<AdminExerciseDto>('/exercises', request);
  return res.data;
}

export async function updateExercise(id: number, request: UpdateExerciseRequest): Promise<AdminExerciseDto> {
  const res = await httpClient.put<AdminExerciseDto>(`/exercises/${id}`, request);
  return res.data;
}

export async function deleteExercise(id: number): Promise<void> {
  await httpClient.delete(`/exercises/${id}`);
}

// Bulk operations
export async function bulkUpdateExercises(operation: BulkExerciseOperation): Promise<BulkExerciseResult> {
  const res = await httpClient.post<BulkExerciseResult>('/exercises/bulk', operation);
  return res.data;
}

// Version management
export async function getExerciseVersions(exerciseId: number): Promise<ExerciseVersion[]> {
  const res = await httpClient.get<ExerciseVersion[]>(`/exercises/${exerciseId}/versions`);
  return res.data;
}

export async function revertExerciseToVersion(exerciseId: number, versionId: number): Promise<AdminExerciseDto> {
  const res = await httpClient.post<AdminExerciseDto>(`/exercises/${exerciseId}/versions/${versionId}/revert`);
  return res.data;
}

// Preview and analytics
export async function getExercisePreview(exerciseId: number): Promise<ExercisePreview> {
  const res = await httpClient.get<ExercisePreview>(`/exercises/${exerciseId}/preview`);
  return res.data;
}

export async function getExerciseAnalytics(exerciseId: number): Promise<ExerciseAnalytics> {
  const res = await httpClient.get<ExerciseAnalytics>(`/exercises/${exerciseId}/analytics`);
  return res.data;
}

// Import/Export
export async function importExercises(file: File): Promise<ExerciseImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await httpClient.post<ExerciseImportResult>('/exercises/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

export async function exportExercises(request: ExerciseExportRequest): Promise<ExerciseExportResult> {
  const params = new URLSearchParams();

  if (request.exerciseIds?.length) params.append('exerciseIds', request.exerciseIds.join(','));
  if (request.types?.length) params.append('types', request.types.join(','));
  if (request.levels?.length) params.append('levels', request.levels.join(','));
  if (request.includeAnalytics !== undefined) params.append('includeAnalytics', request.includeAnalytics.toString());
  if (request.format) params.append('format', request.format);

  const url = `/exercises/export?${params.toString()}`;
  const res = await httpClient.get<ExerciseExportResult>(url);
  return res.data;
}

// Upload audio file for listening exercises
export async function uploadAudioFile(file: File): Promise<{ url: string; durationSeconds?: number | null }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await httpClient.post<{ url: string; durationSeconds?: number | null }>('/exercises/upload-audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// Upload image file for Writing Task 1 (charts, graphs, maps)
export async function uploadImageFile(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await httpClient.post<{ location: string }>('/files/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return { url: res.data.location };
}

// Utility functions
export async function activateExercise(id: number): Promise<AdminExerciseDto> {
  return updateExercise(id, { isActive: true });
}

export async function deactivateExercise(id: number): Promise<AdminExerciseDto> {
  return updateExercise(id, { isActive: false });
}

export async function bulkActivateExercises(exerciseIds: number[]): Promise<BulkExerciseResult> {
  return bulkUpdateExercises({ operation: 'activate', exerciseIds });
}

export async function bulkDeactivateExercises(exerciseIds: number[]): Promise<BulkExerciseResult> {
  return bulkUpdateExercises({ operation: 'deactivate', exerciseIds });
}

export async function bulkDeleteExercises(exerciseIds: number[]): Promise<BulkExerciseResult> {
  return bulkUpdateExercises({ operation: 'delete', exerciseIds });
}
