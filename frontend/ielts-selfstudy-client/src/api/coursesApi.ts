import httpClient from './httpClient';
import type {
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
  AddExerciseToCourseRequest,
  CourseExercise,
  PagedCourseResponse
} from '../types/course';
import type { PagedRequest } from '../types/common';

// API functions for courses

export async function getCourses(request?: PagedRequest): Promise<PagedCourseResponse> {
  const params = request ? new URLSearchParams({
    pageNumber: request.pageNumber.toString(),
    pageSize: request.pageSize.toString(),
    ...(request.search && { search: request.search }),
    ...(request.sortBy && { sortBy: request.sortBy }),
    ...(request.sortDirection && { sortDirection: request.sortDirection }),
  }) : undefined;

  const url = params ? `/courses?${params.toString()}` : '/courses';
  const res = await httpClient.get<PagedCourseResponse>(url);
  return res.data;
}

export async function getCourseById(id: number): Promise<Course> {
  const res = await httpClient.get<Course>(`/courses/${id}`);
  return res.data;
}

export async function createCourse(request: CreateCourseRequest): Promise<Course> {
  const res = await httpClient.post<Course>('/courses', request);
  return res.data;
}

export async function updateCourse(id: number, request: UpdateCourseRequest): Promise<Course> {
  const res = await httpClient.put<Course>(`/courses/${id}`, request);
  return res.data;
}

export async function uploadThumbnail(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await httpClient.post<{ url: string }>('/courses/upload-thumbnail', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data.url;
}

export async function deleteCourse(id: number): Promise<void> {
  await httpClient.delete(`/courses/${id}`);
}

// Course exercises API functions

export async function getCourseExercises(courseId: number): Promise<CourseExercise[]> {
  const res = await httpClient.get<CourseExercise[]>(`/courses/${courseId}/exercises`);
  return res.data;
}

export async function addExerciseToCourse(courseId: number, request: AddExerciseToCourseRequest): Promise<CourseExercise> {
  const res = await httpClient.post<CourseExercise>(`/courses/${courseId}/exercises`, request);
  return res.data;
}

export async function removeExerciseFromCourse(courseId: number, courseExerciseId: number): Promise<void> {
  await httpClient.delete(`/courses/${courseId}/exercises/${courseExerciseId}`);
}

export async function updateExerciseOrder(courseId: number, courseExerciseId: number, newOrder: number): Promise<void> {
  await httpClient.put(`/courses/${courseId}/exercises/${courseExerciseId}/order`, { order: newOrder });
}

// Utility function to get all courses (for backward compatibility)
export async function getAllCourses(): Promise<Course[]> {
  const res = await httpClient.get<Course[]>('/courses');
  return res.data;
}
