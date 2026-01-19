export interface AttemptDto {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  skill: string;
  exerciseId: number;
  exerciseTitle: string;
  courseId?: number;
  courseTitle?: string;
  score?: number;
  maxScore?: number;
  userAnswerJson?: string;
  aiFeedback?: string;
  isGraded: boolean;
  isPassed: boolean;
  gradedBy?: string;
  gradedAt?: string;
  gradingNotes?: string;
  isActive: boolean;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  timeSpentSeconds?: number;
  updatedAt?: string;
}

export interface CreateAttemptRequest {
  userId: number;
  exerciseId: number;
  score?: number;
  maxScore?: number;
  userAnswerJson?: string;
  aiFeedback?: string;
}

export interface UpdateAttemptRequest {
  score?: number;
  maxScore?: number;
  userAnswerJson?: string;
  aiFeedback?: string;
  isActive?: boolean;
}

export interface GradeAttemptRequestDto {
  score: number;
  maxScore: number;
  feedback?: string;
  isPassed: boolean;
  internalNotes?: string;
}

export interface AttemptFiltersDto {
  userId?: number;
  skill?: string;
  exerciseId?: number;
  courseId?: number;
  isGraded?: boolean;
  isPassed?: boolean;
  minScore?: number;
  maxScore?: number;
  fromDate?: Date;
  toDate?: Date;
  sortBy?: string;
  sortDirection?: string;
}

export interface PagedAttemptResponseDto {
  items: AttemptDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
