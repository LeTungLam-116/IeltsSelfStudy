// Exercise related types
export type ExerciseType = 'Listening' | 'Reading' | 'Writing' | 'Speaking';

// Constants
export const EXERCISE_TYPES: ExerciseType[] = ['Listening', 'Reading', 'Writing', 'Speaking'];
export const EXERCISE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// Form data types
export interface CreateExerciseFormData {
  type: ExerciseType;
  title: string;
  description?: string;
  level?: string;
  questionCount?: number;
  isActive?: boolean;
  audioUrl?: string;
  transcript?: string;
  durationSeconds?: number;
  passageText?: string;
  taskType?: string;
  topic?: string;
  minWordCount?: number;
  sampleAnswer?: string;
  part?: string;
  question?: string;
  tips?: string;
}

export interface UpdateExerciseFormData {
  title?: string;
  description?: string;
  level?: string;
  questionCount?: number;
  isActive?: boolean;
  audioUrl?: string;
  transcript?: string;
  durationSeconds?: number;
  passageText?: string;
  taskType?: string;
  topic?: string;
  minWordCount?: number;
  sampleAnswer?: string;
  part?: string;
  question?: string;
  tips?: string;
}

// Additional types for API responses
export interface ExercisePagedResponse extends PagedResponse<AdminExerciseDto> {}

export interface BulkExerciseOperation {
  operation: 'activate' | 'deactivate' | 'delete';
  exerciseIds: number[];
}

export interface Exercise {
  id: number;
  type: ExerciseType;
  title: string;
  description?: string | null;
  level?: string | null;
  questionCount: number;
  isActive: boolean;
  createdAt: string;
  // Type-specific fields
  audioUrl?: string | null;
  transcript?: string | null;
  durationSeconds?: number | null;
  passageText?: string | null;
  taskType?: string | null;
  topic?: string | null;
  minWordCount?: number;
  sampleAnswer?: string | null;
  part?: string | null;
  question?: string | null;
  tips?: string | null;
}

export interface AdminExerciseDto {
  id: number;
  type: ExerciseType;
  title: string;
  description?: string | null;
  level?: string | null;
  questionCount: number;
  isActive: boolean;
  createdAt: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
  // Type-specific fields
  audioUrl?: string | null;
  transcript?: string | null;
  durationSeconds?: number | null;
  passageText?: string | null;
  taskType?: string | null;
  topic?: string | null;
  minWordCount?: number;
  sampleAnswer?: string | null;
  part?: string | null;
  question?: string | null;
  tips?: string | null;
  // Additional admin fields
  totalAttempts?: number;
}

export interface CreateExerciseRequest {
  type: ExerciseType;
  title: string;
  description?: string;
  level?: string;
  questionCount?: number; // Optional: only required for Listening/Reading
  isActive?: boolean;
  // Type-specific fields
  audioUrl?: string;
  transcript?: string;
  durationSeconds?: number;
  passageText?: string;
  taskType?: string;
  topic?: string;
  minWordCount?: number;
  sampleAnswer?: string;
  part?: string;
  question?: string;
  tips?: string;
}

export interface UpdateExerciseRequest {
  title?: string;
  description?: string;
  level?: string;
  questionCount?: number;
  isActive?: boolean;
  // Type-specific fields
  audioUrl?: string;
  transcript?: string;
  durationSeconds?: number;
  passageText?: string;
  taskType?: string;
  topic?: string;
  minWordCount?: number;
  sampleAnswer?: string;
  part?: string;
  question?: string;
  tips?: string;
}

export interface ExerciseFilters {
  types?: ExerciseType[];
  levels?: string[];
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  isActive?: boolean;
}

export interface ExerciseAnalytics {
  totalAttempts: number;
  averageScore: number;
  completionRate: number;
  averageTimeSpent: number;
  passRate?: number;
  popularScoreRanges?: Array<{ range: string; count: number }>;
  lastAttemptAt?: string;
}

export interface ExercisePreview {
  id: number;
  title: string;
  type: ExerciseType;
  description?: string;
  level?: string;
  estimatedDuration: number;
  hasAudio: boolean;
  hasText: boolean;
  hasQuestions: boolean;
  previewData?: any;
}

export interface ExerciseVersion {
  id: number;
  exerciseId: number;
  version: number;
  changes: string;
  createdAt: string;
  createdBy: string;
  isActive?: boolean;
  changeNotes?: string[];
}

export interface BulkExerciseResult {
  success: boolean;
  exerciseId?: number;
  message: string;
}

export interface ExerciseExportRequest {
  exerciseIds: number[];
  includeQuestions: boolean;
  includeAnalytics: boolean;
  types?: ExerciseType[];
  levels?: string[];
  format?: 'json' | 'csv' | 'xlsx';
}

export interface ExerciseExportResult {
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  totalExercises?: number;
  generatedAt?: string;
}

export interface ExerciseImportResult {
  imported: number;
  failed: number;
  skipped?: number;
  errors: string[];
  warnings: string[];
}

export interface ExerciseFiltersData {
  availableTypes: ExerciseType[];
  availableLevels: string[];
  totalCount: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  types?: ExerciseType[];
  levels?: string[];
  isActive?: boolean;
}

// Import pagination types from common
import type { PagedResponse } from './common';

// Re-export for backward compatibility
export type { PagedResponse } from './common';


// Zod validation schemas
import { z } from 'zod';

// Base schema for common fields
const baseExerciseSchema = z.object({
  type: z.enum(['Listening', 'Reading', 'Writing', 'Speaking']),
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  isActive: z.boolean().default(true),
});

// Create schema with conditional validation
export const createExerciseSchema = baseExerciseSchema.extend({
  questionCount: z.number().optional(),
  audioUrl: z.string().optional(),
  transcript: z.string().optional(),
  durationSeconds: z.preprocess((val) => {
    // Accept empty string/undefined/null -> undefined, otherwise coerce to number if possible
    if (val === '' || val === undefined || val === null) return undefined;
    const n = Number(val);
    return Number.isNaN(n) ? undefined : n;
  }, z.number().min(1).optional()),
  passageText: z.string().optional(),
  taskType: z.string().optional(),
  topic: z.string().optional(),
  minWordCount: z.number().min(1).optional(),
  sampleAnswer: z.string().optional(),
  part: z.string().optional(),
  question: z.string().optional(),
  tips: z.string().optional(),
}).superRefine((data, ctx) => {
  // Conditional validation based on exercise type
  if (data.type === 'Listening' || data.type === 'Reading') {
    if (!data.questionCount || data.questionCount < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['questionCount'],
        message: "At least 1 question required for this exercise type"
      });
    } else if (data.questionCount > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['questionCount'],
        message: "Maximum 100 questions allowed"
      });
    }
  }

  // Type-specific validations
  if (data.type === 'Listening') {
    if (!data.audioUrl || data.audioUrl.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['audioUrl'],
        message: "Audio URL is required for Listening exercises"
      });
    }
  }

  if (data.type === 'Reading') {
    if (!data.passageText || data.passageText.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['passageText'],
        message: "Passage text is required for Reading exercises"
      });
    }
  }

  if (data.type === 'Writing') {
    if (!data.taskType || data.taskType.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['taskType'],
        message: "Task type is required for Writing exercises"
      });
    }
    if (!data.topic || data.topic.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['topic'],
        message: "Topic is required for Writing exercises"
      });
    }
  }

  if (data.type === 'Speaking') {
    if (!data.question || data.question.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['question'],
        message: "Question/prompt is required for Speaking exercises"
      });
    }
  }
});

// Update schema - không sử dụng superRefine để tránh conflict với .partial()
export const updateExerciseSchema = baseExerciseSchema.extend({
  questionCount: z.number().optional(),
  audioUrl: z.string().optional(),
  transcript: z.string().optional(),
  durationSeconds: z.preprocess((val) => {
    if (val === '' || val === undefined || val === null) return undefined;
    const n = Number(val);
    return Number.isNaN(n) ? undefined : n;
  }, z.number().min(1).optional()),
  passageText: z.string().optional(),
  taskType: z.string().optional(),
  topic: z.string().optional(),
  minWordCount: z.number().min(1).optional(),
  sampleAnswer: z.string().optional(),
  part: z.string().optional(),
  question: z.string().optional(),
  tips: z.string().optional(),
}).partial();

// Re-export types from other modules for convenience
export type { AttemptDto as Attempt } from './attempts';

// Alias for backward compatibility
export type ExerciseFormData = CreateExerciseFormData;