import type { Course, CourseFormData } from '../types/course';

const STORAGE_KEY = 'mockCourses_v1';

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

export async function getAllCourses(): Promise<Course[]> {
  seedIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEY) || '[]';
  return JSON.parse(raw) as Course[];
}

export async function getCourseById(id: number): Promise<Course | undefined> {
  const list = await getAllCourses();
  return list.find((c) => c.id === id);
}

export async function createCourse(payload: CourseFormData): Promise<Course> {
  const list = await getAllCourses();
  const id = list.length ? Math.max(...list.map((c) => c.id)) + 1 : 1;
  const newCourse: Course = {
    id,
    title: payload.title,
    description: payload.description || null,
    skill: payload.skill,
    level: payload.level || null,
    targetBand: payload.targetBand ?? null,
    isActive: payload.isActive,
    createdAt: new Date().toISOString(),
  };
  list.unshift(newCourse);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return newCourse;
}

export async function updateCourse(id: number, payload: CourseFormData): Promise<Course | undefined> {
  const list = await getAllCourses();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  const updated: Course = {
    ...list[idx],
    title: payload.title,
    description: payload.description || null,
    skill: payload.skill,
    level: payload.level || null,
    targetBand: payload.targetBand ?? null,
    isActive: payload.isActive,
  };
  list[idx] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return updated;
}

export async function deleteCourse(id: number): Promise<void> {
  const list = await getAllCourses();
  const filtered = list.filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}


