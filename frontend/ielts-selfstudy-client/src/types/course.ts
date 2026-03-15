import { z } from 'zod';
import type { PagedResponse } from './common';

// Course DTOs from backend
export interface Course {
  id: number;
  name: string;
  shortDescription?: string | null;
  level: string; // Beginner, Intermediate, Advanced
  skill: string; // All, Listening, Reading, Writing, Speaking
  targetBand?: number | null;
  price?: number | null;
  isActive: boolean;
  thumbnailUrl?: string | null;
  createdAt: string;
  exercises?: CourseExercise[] | null;
}

export interface CourseExercise {
  id: number;
  courseId: number;
  skill: string;
  exerciseId: number;
  order: number;
  lessonNumber?: number | null;
  createdAt: string;
  exercise?: any | null; // Exercise details (optional)
}

// Request DTOs
export interface CreateCourseRequest {
  name: string;
  shortDescription?: string | null;
  level: string;
  skill: string;
  targetBand?: number | null;
  price?: number | null;
  thumbnailUrl?: string | null;
}

export interface UpdateCourseRequest {
  name: string;
  shortDescription?: string | null;
  level: string;
  skill: string;
  targetBand?: number | null;
  price?: number | null;
  isActive: boolean;
  thumbnailUrl?: string | null;
}

export interface AddExerciseToCourseRequest {
  exerciseId: number;
  order: number;
  lessonNumber?: number | null;
}

// Response types
export interface PagedCourseResponse extends PagedResponse<Course> { }

// Form data types for frontend forms
export interface CourseFormData {
  name: string;
  shortDescription?: string;
  level: string;
  skill: string;
  targetBand?: number;
  price?: number;
  isActive?: boolean;
  thumbnailUrl?: string;
}

// Exercise assignment types
export interface ExerciseAssignment {
  exerciseId: number;
  order: number;
  lessonNumber?: number;
}

export const exerciseAssignmentSchema = z.object({
  exerciseId: z.number().min(1, 'Exercise ID is required'),
  order: z.number().min(1, 'Order must be at least 1'),
  lessonNumber: z.union([z.number().min(1).optional(), z.literal('').transform(() => undefined)]).nullable(),
});

export type CourseFormDataValidated = z.infer<typeof courseFormSchema>;
export type ExerciseAssignmentValidated = z.infer<typeof exerciseAssignmentSchema>;

// Constants
export const COURSE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
export const COURSE_SKILLS = ['All', 'Listening', 'Reading', 'Writing', 'Speaking'] as const;

export type CourseLevel = typeof COURSE_LEVELS[number];
export type CourseSkill = typeof COURSE_SKILLS[number];

// Zod validation schemas
export const courseFormSchema = z.object({
  name: z.string().min(1, 'Course name is required').max(255, 'Course name must be less than 255 characters'),
  shortDescription: z.string().max(500, 'Description must be less than 500 characters').optional().nullable(),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  skill: z.enum(['All', 'Listening', 'Reading', 'Writing', 'Speaking']),
  targetBand: z.union([z.number().min(0).max(9).optional(), z.literal('').transform(() => undefined)]).nullable(),
  price: z.union([z.number().min(0).optional(), z.literal('').transform(() => undefined)]).nullable(),
  isActive: z.boolean().default(true),
  thumbnailUrl: z.string().url('Trường này phải là một đường dẫn URL hợp lệ').max(1000, 'Link ảnh không được quá 1000 ký tự').optional().or(z.literal('')).nullable(),
});