import { create } from 'zustand';
import type { Exercise, ExerciseType, Attempt } from '../types';
import { getAllExercises, getExerciseById } from '../services/exerciseService';
import { createAttempt } from '../api/attemptApi';
import { useAuthStore } from './authStore';

interface ExerciseState {
  // State
  exercises: Exercise[];
  currentExercise: Exercise | null;
  currentQuestions: any[]; // Will be defined later with Question type
  currentAttempt: Attempt | null;
  answers: Record<number, string>; // questionId -> answer
  timeRemaining: number; // in seconds
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchExercises: (type?: ExerciseType) => Promise<void>;
  fetchExerciseById: (type: ExerciseType, id: number) => Promise<void>;
  startExercise: (exercise: Exercise) => void;
  submitExercise: (exerciseId: number, answers: Record<number, string>) => Promise<void>;
  updateAnswer: (questionId: number, answer: string) => void;
  clearAnswers: () => void;
  setTimeRemaining: (time: number) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  // Initial state
  exercises: [],
  currentExercise: null,
  currentQuestions: [],
  currentAttempt: null,
  answers: {},
  timeRemaining: 0,
  isLoading: false,
  error: null,

  // Actions
  fetchExercises: async (type?: ExerciseType) => {
    set({ isLoading: true, error: null });
    try {
      const exercises = await getAllExercises(type);
      set({ exercises, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch exercises';
      set({ error: message, isLoading: false });
    }
  },

  fetchExerciseById: async (type: ExerciseType, id: number) => {
    set({ isLoading: true, error: null });
    try {
      const exercise = await getExerciseById(type, id);

      if (!exercise) {
        throw new Error('Exercise not found');
      }

      // TODO: In a real implementation, we'd fetch questions separately
      // For now, use mock questions based on the exercise
      const questions = Array.from({ length: exercise.questionCount }, (_, index) => ({
        id: index + 1,
        text: `Question ${index + 1}?`,
        options: ['A', 'B', 'C', 'D'],
      }));

      set({
        currentExercise: exercise,
        currentQuestions: questions,
        timeRemaining: 3600, // 1 hour
        answers: {},
        isLoading: false
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch exercise';
      set({ error: message, isLoading: false });
    }
  },

  startExercise: (exercise: Exercise) => {
    set({
      currentExercise: exercise,
      timeRemaining: 3600, // 1 hour default
      answers: {},
      currentAttempt: null,
    });
  },

  submitExercise: async (exerciseId: number, answers: Record<number, string>) => {
    set({ isLoading: true, error: null });
    try {
      const currentExercise = get().currentExercise;
      if (!currentExercise) {
        throw new Error('No current exercise');
      }

      // Get user from auth store
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Submit to API
      const attemptDto = await createAttempt({
        userId: user.id,
        skill: currentExercise.type,
        exerciseId,
        userAnswerJson: JSON.stringify(answers),
        // score, maxScore, and aiFeedback will be calculated by backend or AI
      });

      // Convert API response to our Attempt type
      const attempt: Attempt = {
        id: attemptDto.id,
        userId: attemptDto.userId,
        exerciseId: attemptDto.exerciseId,
        score: attemptDto.score === null ? undefined : attemptDto.score,
        maxScore: attemptDto.maxScore === null ? undefined : attemptDto.maxScore,
        userAnswerJson: attemptDto.userAnswerJson === null ? undefined : attemptDto.userAnswerJson,
        aiFeedback: attemptDto.aiFeedback === null ? undefined : attemptDto.aiFeedback,
        isActive: attemptDto.isActive,
        createdAt: attemptDto.createdAt,
      };

      set({
        currentAttempt: attempt,
        isLoading: false
      });

      // Clear answers after successful submission
      get().clearAnswers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit exercise';
      set({ error: message, isLoading: false });
    }
  },

  updateAnswer: (questionId: number, answer: string) => {
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: answer,
      },
    }));
  },

  clearAnswers: () => {
    set({ answers: {} });
  },

  setTimeRemaining: (time: number) => {
    set({ timeRemaining: time });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      exercises: [],
      currentExercise: null,
      currentQuestions: [],
      currentAttempt: null,
      answers: {},
      timeRemaining: 0,
      isLoading: false,
      error: null,
    });
  },
}));
