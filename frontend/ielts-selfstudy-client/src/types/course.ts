// Course types matching backend DTOs
export interface Course {
  id: number;
  name?: string; // Backend uses 'name'
  title?: string; // Frontend alias
  description?: string | null;
  shortDescription?: string | null; // Backend uses 'shortDescription'
  level: string;
  skill: 'Listening' | 'Reading' | 'Writing' | 'Speaking';
  targetBand?: number | null;
  price?: number | null;
  isActive: boolean;
  createdAt: string;
  exercises?: CourseExercise[];
}

export interface CourseExercise {
  id: number;
  courseId: number;
  skill: string;
  exerciseId: number;
  order: number;
  lessonNumber?: number | null;
  createdAt: string;
  exercise?: any; // Exercise details if loaded
}

export interface CourseFormData {
  name: string;
  shortDescription?: string;
  level: string;
  skill: 'Listening' | 'Reading' | 'Writing' | 'Speaking';
  targetBand?: number | null;
  price?: number | null;
  isActive: boolean;
}

export interface AddExerciseToCourseData {
  skill: string;
  exerciseId: number;
  order: number;
  lessonNumber?: number | null;
}
