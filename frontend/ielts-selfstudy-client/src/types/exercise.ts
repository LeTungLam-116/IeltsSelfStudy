// Exercise related types
export type ExerciseType = 'Listening' | 'Reading' | 'Writing' | 'Speaking';

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

export interface Question {
  id: number;
  exerciseId: number;
  text: string;
  type?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  order?: number;
}

export interface Attempt {
  id: number;
  userId: number;
  exerciseId: number;
  score?: number | null;
  maxScore?: number | null;
  userAnswerJson?: string | null;
  aiFeedback?: string | null;
  isActive: boolean;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface QuestionResult {
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  score?: number;
  feedback?: string;
}

export interface ExerciseAttempt {
  attemptId: number;
  exerciseId: number;
  exerciseTitle: string;
  score?: number;
  maxScore?: number;
  completedAt: string;
  timeSpent?: number; // in seconds
}

export interface EvaluateWritingRequest {
  userId: number;
  essayText: string;
  targetBand?: number;
}

export interface EvaluateWritingResponse {
  attemptId: number;
  score?: number | null;
  maxScore?: number | null;
  feedback?: string | null;
}

export interface EvaluateSpeakingRequest {
  userId: number;
  audioUrl: string;
  targetBand?: number;
}

export interface EvaluateSpeakingResponse {
  attemptId: number;
  score?: number | null;
  maxScore?: number | null;
  feedback?: string | null;
}

// Form data types
export interface ExerciseFormData {
  title: string;
  description?: string;
  type: ExerciseType;
  level?: string;
  questionCount: number;
  isActive: boolean;
  // Type-specific form fields
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

export interface SubmitExerciseRequest {
  answers: Record<number, string>; // questionId -> answer
  timeSpent?: number; // in seconds
}
