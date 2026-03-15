import httpClient from "./httpClient";

export interface CourseExerciseDto {
  id: number;
  courseId: number;
  skill: string;
  exerciseId: number;
  order: number;
  lessonNumber?: number | null;
  exercise?: {
    id: number;
    title: string;
    type: string;
    level: string;
    questionCount: number;
  } | null;
  // Trophy data (filled when user is logged in)
  trophyCount?: number;               // 0-3
  highestScorePercent?: number | null; // Listening/Reading/Grammar: e.g. 85.5%
  highestBandScore?: number | null;   // Writing/Speaking: e.g. 5.5 (IELTS band)
}

export interface CourseDto {
  id: number;
  name: string;
  shortDescription?: string | null;
  thumbnailUrl?: string | null;
  level: string;
  skill: string;
  targetBand?: number | null;
  price?: number | null;
  isActive: boolean;
  createdAt: string;
  exercises?: CourseExerciseDto[] | null;
  isEnrolled?: boolean;
  // Course progress (filled when user is logged in)
  totalExercises?: number;
  completedExercises?: number;
  progressPercent?: number;       // 0-100
  isCompleted?: boolean;
}

export async function getCourses(): Promise<CourseDto[]> {
  const res = await httpClient.get<CourseDto[]>("/courses");
  return res.data;
}

export async function getCourseById(id: number): Promise<CourseDto> {
  const res = await httpClient.get<CourseDto>(`/courses/${id}`);
  return res.data;
}

export async function getMyEnrolledCourseIds(): Promise<number[]> {
  const res = await httpClient.get<number[]>("/courses/my-enrolled-ids");
  return res.data;
}
