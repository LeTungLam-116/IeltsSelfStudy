import httpClient from "./httpClient";

export interface CourseDto {
  id: number;
  name: string;
  shortDescription?: string | null;
  level: string;
  skill: string;
  targetBand?: number | null;
  price?: number | null;
  isActive: boolean;
  createdAt: string;
  exercises?: CourseExerciseDto[];
}

export interface CourseExerciseDto {
  id: number;
  courseId: number;
  skill: string;
  exerciseId: number;
  order: number;
  lessonNumber?: number | null;
  createdAt: string;
  exercise?: any; // Exercise details if loaded
}

export interface CreateCourseRequest {
  name: string;
  shortDescription?: string | null;
  level: string;
  skill: string;
  targetBand?: number | null;
  price?: number | null;
}

export interface UpdateCourseRequest {
  name: string;
  shortDescription?: string | null;
  level: string;
  skill: string;
  targetBand?: number | null;
  price?: number | null;
  isActive: boolean;
}

export interface AddExerciseToCourseRequest {
  skill: string;
  exerciseId: number;
  order: number;
  lessonNumber?: number | null;
}

// Courses CRUD
export async function getCourses(): Promise<CourseDto[]> {
  const res = await httpClient.get<CourseDto[]>("/courses");
  return res.data;
}

export async function getCourseById(id: number): Promise<CourseDto> {
  const res = await httpClient.get<CourseDto>(`/courses/${id}`);
  return res.data;
}

export async function createCourse(request: CreateCourseRequest): Promise<CourseDto> {
  const res = await httpClient.post<CourseDto>("/courses", request);
  return res.data;
}

export async function updateCourse(id: number, request: UpdateCourseRequest): Promise<CourseDto> {
  const res = await httpClient.put<CourseDto>(`/courses/${id}`, request);
  return res.data;
}

export async function deleteCourse(id: number): Promise<void> {
  await httpClient.delete(`/courses/${id}`);
}

// Course-Exercise Management
export async function getCourseExercises(courseId: number): Promise<CourseExerciseDto[]> {
  const res = await httpClient.get<CourseExerciseDto[]>(`/courses/${courseId}/exercises`);
  return res.data;
}

export async function addExerciseToCourse(courseId: number, request: AddExerciseToCourseRequest): Promise<CourseExerciseDto> {
  const res = await httpClient.post<CourseExerciseDto>(`/courses/${courseId}/exercises`, request);
  return res.data;
}

export async function removeExerciseFromCourse(courseId: number, courseExerciseId: number): Promise<void> {
  await httpClient.delete(`/courses/${courseId}/exercises/${courseExerciseId}`);
}

export async function updateExerciseOrder(courseId: number, courseExerciseId: number, newOrder: number): Promise<void> {
  await httpClient.put(`/courses/${courseId}/exercises/${courseExerciseId}/order`, newOrder);
}
