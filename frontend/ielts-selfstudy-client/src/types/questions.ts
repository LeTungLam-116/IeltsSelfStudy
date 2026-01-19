// Question types for admin management
export type QuestionType = 'MultipleChoice' | 'FillBlank' | 'Essay' | 'TrueFalse';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface QuestionDto {
  id: number;
  skill: string; // "Listening", "Reading", "Writing", "Speaking"
  exerciseId: number;
  questionNumber: number;
  questionText: string; // Markdown content
  questionType: QuestionType;
  correctAnswer: string;
  points: number;
  optionsJson: string | null; // JSON string of QuestionOption[]
  isActive: boolean;
  createdAt: string;
}

export interface CreateQuestionRequest {
  exerciseId: number;
  questionNumber: number;
  questionText: string;
  questionType: QuestionType;
  correctAnswer: string;
  points: number;
  optionsJson?: string; // JSON string of QuestionOption[]
}

export interface UpdateQuestionRequest {
  exerciseId: number;
  questionNumber: number;
  questionText: string;
  questionType: QuestionType;
  correctAnswer: string;
  points: number;
  optionsJson?: string;
  isActive: boolean;
}

export interface QuestionFilters {
  exerciseId?: number;
  skill?: string;
  questionType?: QuestionType;
  isActive?: boolean;
  search?: string; // search in question text
}

// Form data types for UI
export interface QuestionFormData {
  exerciseId: number;
  questionNumber: number;
  questionText: string;
  questionType: QuestionType;
  correctAnswer: string;
  points: number;
  options: QuestionOption[]; // UI-friendly array instead of JSON string
  isActive: boolean;
}
