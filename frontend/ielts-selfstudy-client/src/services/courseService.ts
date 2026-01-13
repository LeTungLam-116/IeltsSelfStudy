import httpClient from '../api/httpClient';
import type { Course, CourseFormData, CourseExercise } from '../types/course';

const STORAGE_KEY = 'mockCourses_v1';

// Fallback functions for when backend is not available
function seedIfEmpty() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const now = new Date().toISOString();
    const seed: Course[] = [
      {
        id: 1,
        title: 'General Writing Course',
        description: 'Improve your general writing skills',
        skill: 'Writing',
        level: 'Intermediate',
        targetBand: 6.0,
        isActive: true,
        createdAt: now,
      },
      {
        id: 2,
        title: 'Academic Reading',
        description: 'Practice academic reading passages',
        skill: 'Reading',
        level: 'Advanced',
        targetBand: 7.0,
        isActive: true,
        createdAt: now,
      },
      {
        id: 3,
        title: 'Listening Foundations',
        description: 'Basic listening practice',
        skill: 'Listening',
        level: 'Beginner',
        targetBand: 5.0,
        isActive: false,
        createdAt: now,
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  }
}

async function getAllCoursesFallback(): Promise<Course[]> {
  seedIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEY) || '[]';
  return JSON.parse(raw) as Course[];
}

async function getCourseByIdFallback(id: number): Promise<Course | undefined> {
  const list = await getAllCoursesFallback();
  return list.find((c) => c.id === id);
}

async function createCourseFallback(payload: CourseFormData): Promise<Course> {
  const list = await getAllCoursesFallback();
  const id = list.length ? Math.max(...list.map((c) => c.id)) + 1 : 1;
  const newCourse: Course = {
    id,
    title: payload.name,
    description: payload.shortDescription || null,
    skill: payload.skill,
    level: payload.level,
    targetBand: payload.targetBand ?? null,
    price: payload.price ?? null,
    isActive: payload.isActive,
    createdAt: new Date().toISOString(),
  };
  list.unshift(newCourse);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return newCourse;
}

async function updateCourseFallback(id: number, payload: CourseFormData): Promise<Course | undefined> {
  const list = await getAllCoursesFallback();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  const updated: Course = {
    ...list[idx],
    title: payload.name,
    description: payload.shortDescription || null,
    skill: payload.skill,
    level: payload.level,
    targetBand: payload.targetBand ?? null,
    price: payload.price ?? null,
    isActive: payload.isActive,
  };
  list[idx] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return updated;
}

async function deleteCourseFallback(id: number): Promise<void> {
  const list = await getAllCoursesFallback();
  const filtered = list.filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export async function getAllCourses(): Promise<Course[]> {
  try {
    const res = await httpClient.get<Course[]>('/courses');
    // Map backend fields to frontend fields
    return res.data.map(course => ({
      ...course,
      title: course.name || course.title, // Backend uses 'name', frontend uses 'title'
      description: course.shortDescription || course.description, // Backend uses 'shortDescription'
    }));
  } catch (error) {
    console.warn('Backend not available for getAllCourses, falling back to mock data:', error);
    return getAllCoursesFallback();
  }
}

export async function getCourseById(id: number): Promise<Course | undefined> {
  try {
    const res = await httpClient.get<Course>(`/courses/${id}`);
    const course = res.data;
    return {
      ...course,
      title: course.name || course.title,
      description: course.shortDescription || course.description,
    };
  } catch (error) {
    console.warn(`Backend not available for getCourseById(${id}), falling back to mock data:`, error);
    return getCourseByIdFallback(id);
  }
}

export async function createCourse(payload: CourseFormData): Promise<Course> {
  try {
    const res = await httpClient.post<Course>('/courses', payload);
    const course = res.data;
    return {
      ...course,
      title: course.name || course.title || payload.name,
      description: course.shortDescription || course.description || payload.shortDescription,
    };
  } catch (error) {
    console.warn('Backend not available for createCourse, falling back to mock data:', error);
    return createCourseFallback(payload);
  }
}

export async function updateCourse(id: number, payload: CourseFormData): Promise<Course | undefined> {
  try {
    const res = await httpClient.put<Course>(`/courses/${id}`, payload);
    const course = res.data;
    return {
      ...course,
      title: course.name || course.title || payload.name,
      description: course.shortDescription || course.description || payload.shortDescription,
    };
  } catch (error) {
    console.warn(`Backend not available for updateCourse(${id}), falling back to mock data:`, error);
    return updateCourseFallback(id, payload);
  }
}

export async function deleteCourse(id: number): Promise<void> {
  try {
    await httpClient.delete(`/courses/${id}`);
  } catch (error) {
    console.warn(`Backend not available for deleteCourse(${id}), falling back to mock data:`, error);
    await deleteCourseFallback(id);
  }
}

// Course-Exercise Management
export async function getCourseExercises(courseId: number): Promise<CourseExercise[]> {
  try {
    const res = await httpClient.get<CourseExercise[]>(`/courses/${courseId}/exercises`);
    return res.data;
  } catch (error) {
    console.warn(`Backend not available for getCourseExercises(${courseId}), returning empty array:`, error);
    return [];
  }
}

export async function addExerciseToCourse(courseId: number, payload: AddExerciseToCourseData): Promise<CourseExercise> {
  try {
    const res = await httpClient.post<CourseExercise>(`/courses/${courseId}/exercises`, payload);
    return res.data;
  } catch (error) {
    console.warn(`Backend not available for addExerciseToCourse(${courseId}), throwing error:`, error);
    throw error;
  }
}

export async function removeExerciseFromCourse(courseId: number, courseExerciseId: number): Promise<void> {
  try {
    await httpClient.delete(`/courses/${courseId}/exercises/${courseExerciseId}`);
  } catch (error) {
    console.warn(`Backend not available for removeExerciseFromCourse(${courseId}, ${courseExerciseId}), throwing error:`, error);
    throw error;
  }
}

export async function updateExerciseOrder(courseId: number, courseExerciseId: number, newOrder: number): Promise<void> {
  try {
    await httpClient.put(`/courses/${courseId}/exercises/${courseExerciseId}/order`, newOrder);
  } catch (error) {
    console.warn(`Backend not available for updateExerciseOrder(${courseId}, ${courseExerciseId}), throwing error:`, error);
    throw error;
  }
}
