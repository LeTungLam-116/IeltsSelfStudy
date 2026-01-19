import { create } from 'zustand';
import type {
  AdminExerciseDto,
  CreateExerciseRequest,
  UpdateExerciseRequest,
  ExerciseVersion,
  ExerciseAnalytics,
  ExercisePreview,
  ExerciseFilters,
  BulkExerciseResult,
  ExerciseExportRequest,
  ExerciseExportResult,
  ExerciseImportResult,
  ExerciseFiltersData
} from '../types/exercise';
import type { PagedRequest } from '../types/common';
import {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
  bulkActivateExercises,
  bulkDeactivateExercises,
  bulkDeleteExercises,
  getExerciseVersions,
  revertExerciseToVersion,
  getExercisePreview,
  getExerciseAnalytics,
  importExercises,
  exportExercises
} from '../api/exercisesApi';

interface ExerciseState {
  // State
  exercises: AdminExerciseDto[];
  currentExercise: AdminExerciseDto | null;
  exerciseVersions: ExerciseVersion[];
  exerciseAnalytics: ExerciseAnalytics | null;
  exercisePreview: ExercisePreview | null;
  pagination: {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
  filters: ExerciseFiltersData;
  selectedIds: number[];
  isLoading: boolean;
  error: string | null;

  // Import/Export state
  isImporting: boolean;
  importResult: ExerciseImportResult | null;
  isExporting: boolean;
  exportResult: ExerciseExportResult | null;

  // Actions
  fetchExercises: (request?: PagedRequest & ExerciseFilters) => Promise<void>;
  fetchExerciseById: (id: number) => Promise<AdminExerciseDto>;
  createExercise: (request: CreateExerciseRequest) => Promise<AdminExerciseDto>;
  updateExercise: (id: number, request: UpdateExerciseRequest) => Promise<AdminExerciseDto>;
  deleteExercise: (id: number) => Promise<void>;
  bulkActivate: (ids: number[]) => Promise<BulkExerciseResult>;
  bulkDeactivate: (ids: number[]) => Promise<BulkExerciseResult>;
  bulkDelete: (ids: number[]) => Promise<BulkExerciseResult>;
  activateExercise: (id: number) => Promise<AdminExerciseDto>;
  deactivateExercise: (id: number) => Promise<AdminExerciseDto>;

  // Version management
  fetchExerciseVersions: (exerciseId: number) => Promise<ExerciseVersion[]>;
  revertExerciseToVersion: (exerciseId: number, versionId: number) => Promise<AdminExerciseDto>;

  // Preview and analytics
  fetchExercisePreview: (exerciseId: number) => Promise<ExercisePreview>;
  fetchExerciseAnalytics: (exerciseId: number) => Promise<ExerciseAnalytics>;

  // Import/Export
  importExercisesFromFile: (file: File) => Promise<ExerciseImportResult>;
  exportExercisesToFile: (request: ExerciseExportRequest) => Promise<ExerciseExportResult>;

  // UI state management
  setFilters: (filters: Partial<ExerciseFiltersData>) => void;
  clearFilters: () => void;
  setSearch: (search: string) => void;
  setPage: (pageNumber: number, pageSize?: number) => void;
  toggleSelect: (id: number) => void;
  selectAll: (selectAll: boolean) => void;
  clearSelection: () => void;

  // Utility
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  // Initial state
  exercises: [],
  currentExercise: null,
  exerciseVersions: [],
  exerciseAnalytics: null,
  exercisePreview: null,
  pagination: null,
  filters: {
    availableTypes: [],
    availableLevels: [],
    totalCount: 0,
  },
  selectedIds: [],
  isLoading: false,
  error: null,
  isImporting: false,
  importResult: null,
  isExporting: false,
  exportResult: null,

  // Actions
  createExercise: async (request: CreateExerciseRequest) => {
    set({ isLoading: true, error: null });
    try {
      const exercise = await createExercise(request);
      console.log('exerciseStore - createExercise success:', exercise);

      // Add to the exercises list if we're on the first page
      const currentExercises = get().exercises;
      if (get().pagination?.pageNumber === 1) {
        set({ exercises: [exercise, ...currentExercises], isLoading: false });
      } else {
        set({ isLoading: false });
      }
      return exercise;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create exercise';
      console.error('exerciseStore - createExercise error:', error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateExercise: async (id: number, request: UpdateExerciseRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedExercise = await updateExercise(id, request);
      console.log('exerciseStore - updateExercise success:', updatedExercise);

      // Update in the exercises list
      const currentExercises = get().exercises;
      const updatedExercises = currentExercises.map(exercise =>
        exercise.id === id ? updatedExercise : exercise
      );
      set({
        exercises: updatedExercises,
        currentExercise: get().currentExercise?.id === id ? updatedExercise : get().currentExercise,
        isLoading: false,
      });
      return updatedExercise;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update exercise';
      console.error('exerciseStore - updateExercise error:', error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteExercise: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await deleteExercise(id);
      console.log('exerciseStore - deleteExercise success');

      // Remove from the exercises list
      const currentExercises = get().exercises;
      const filteredExercises = currentExercises.filter(exercise => exercise.id !== id);
      const currentPagination = get().pagination;
      if (currentPagination) {
        const newTotalCount = currentPagination.totalCount - 1;
        set({
          exercises: filteredExercises,
          pagination: {
            ...currentPagination,
            totalCount: newTotalCount,
            totalPages: Math.ceil(newTotalCount / currentPagination.pageSize),
            hasNextPage: currentPagination.pageNumber < Math.ceil(newTotalCount / currentPagination.pageSize),
          },
          isLoading: false,
        });
      } else {
        set({ exercises: filteredExercises, isLoading: false });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete exercise';
      console.error('exerciseStore - deleteExercise error:', error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  bulkActivate: async (ids: number[]) => {
    set({ isLoading: true, error: null });
    try {
      const result = await bulkActivateExercises(ids);
      console.log('exerciseStore - bulkActivate success:', result);

      // Update the exercises in the list
      const currentExercises = get().exercises;
      const updatedExercises = currentExercises.map(exercise =>
        ids.includes(exercise.id) ? { ...exercise, isActive: true } : exercise
      );
      set({ exercises: updatedExercises, selectedIds: [], isLoading: false });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to activate exercises';
      console.error('exerciseStore - bulkActivate error:', error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  bulkDeactivate: async (ids: number[]) => {
    set({ isLoading: true, error: null });
    try {
      const result = await bulkDeactivateExercises(ids);
      console.log('exerciseStore - bulkDeactivate success:', result);

      // Update the exercises in the list
      const currentExercises = get().exercises;
      const updatedExercises = currentExercises.map(exercise =>
        ids.includes(exercise.id) ? { ...exercise, isActive: false } : exercise
      );
      set({ exercises: updatedExercises, selectedIds: [], isLoading: false });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to deactivate exercises';
      console.error('exerciseStore - bulkDeactivate error:', error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isLoading: true, error: null });
    try {
      const result = await bulkDeleteExercises(ids);
      console.log('exerciseStore - bulkDelete success:', result);

      // Remove from the exercises list
      const currentExercises = get().exercises;
      const filteredExercises = currentExercises.filter(exercise => !ids.includes(exercise.id));
      const currentPagination = get().pagination;
      if (currentPagination) {
        const newTotalCount = currentPagination.totalCount - ids.length;
        set({
          exercises: filteredExercises,
          selectedIds: [],
          pagination: {
            ...currentPagination,
            totalCount: newTotalCount,
            totalPages: Math.ceil(newTotalCount / currentPagination.pageSize),
            hasNextPage: currentPagination.pageNumber < Math.ceil(newTotalCount / currentPagination.pageSize),
          },
          isLoading: false,
        });
      } else {
        set({ exercises: filteredExercises, selectedIds: [], isLoading: false });
      }
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete exercises';
      console.error('exerciseStore - bulkDelete error:', error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  activateExercise: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const exercise = await updateExercise(id, { isActive: true });
      console.log('exerciseStore - activateExercise success:', exercise);

      // Update in the exercises list
      const currentExercises = get().exercises;
      const updatedExercises = currentExercises.map(ex =>
        ex.id === id ? { ...ex, isActive: true } : ex
      );
      set({
        exercises: updatedExercises,
        currentExercise: get().currentExercise?.id === id ? { ...get().currentExercise!, isActive: true } : get().currentExercise,
        isLoading: false,
      });
      return exercise;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to activate exercise';
      console.error('exerciseStore - activateExercise error:', error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deactivateExercise: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const exercise = await updateExercise(id, { isActive: false });
      console.log('exerciseStore - deactivateExercise success:', exercise);

      // Update in the exercises list
      const currentExercises = get().exercises;
      const updatedExercises = currentExercises.map(ex =>
        ex.id === id ? { ...ex, isActive: false } : ex
      );
      set({
        exercises: updatedExercises,
        currentExercise: get().currentExercise?.id === id ? { ...get().currentExercise!, isActive: false } : get().currentExercise,
        isLoading: false,
      });
      return exercise;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to deactivate exercise';
      console.error('exerciseStore - deactivateExercise error:', error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchExerciseById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const exercise = await getExerciseById(id);
      set({ currentExercise: exercise, isLoading: false });
      return exercise;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch exercise';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchExercises: async (request?: PagedRequest & ExerciseFilters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getExercises(request);

      console.log('exerciseStore - fetchExercises success:', {
        itemsCount: response.items.length,
        totalCount: response.totalCount,
        filters: request,
      });

      set({
        exercises: response.items,
        pagination: {
          totalCount: response.totalCount,
          pageNumber: response.pageNumber,
          pageSize: response.pageSize,
          totalPages: response.totalPages,
          hasNextPage: response.hasNextPage,
          hasPreviousPage: response.hasPreviousPage,
        },
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch exercises';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Version management
  fetchExerciseVersions: async (exerciseId: number) => {
    set({ isLoading: true, error: null });
    try {
      const versions = await getExerciseVersions(exerciseId);
      set({ exerciseVersions: versions, isLoading: false });
      return versions;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch exercise versions';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  revertExerciseToVersion: async (exerciseId: number, versionId: number) => {
    set({ isLoading: true, error: null });
    try {
      const exercise = await revertExerciseToVersion(exerciseId, versionId);
      console.log('exerciseStore - revertExerciseToVersion success:', exercise);

      // Update in the exercises list
      const currentExercises = get().exercises;
      const updatedExercises = currentExercises.map(ex =>
        ex.id === exerciseId ? exercise : ex
      );
      set({
        exercises: updatedExercises,
        currentExercise: get().currentExercise?.id === exerciseId ? exercise : get().currentExercise,
        isLoading: false,
      });
      return exercise;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to revert exercise';
      console.error('exerciseStore - revertExerciseToVersion error:', error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Preview and analytics
  fetchExercisePreview: async (exerciseId: number) => {
    set({ isLoading: true, error: null });
    try {
      const preview = await getExercisePreview(exerciseId);
      set({ exercisePreview: preview, isLoading: false });
      return preview;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch exercise preview';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchExerciseAnalytics: async (exerciseId: number) => {
    set({ isLoading: true, error: null });
    try {
      const analytics = await getExerciseAnalytics(exerciseId);
      set({ exerciseAnalytics: analytics, isLoading: false });
      return analytics;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch exercise analytics';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Import/Export
  importExercisesFromFile: async (file: File) => {
    set({ isImporting: true, error: null, importResult: null });
    try {
      const result = await importExercises(file);
      set({ importResult: result, isImporting: false });

      // Refresh the exercises list
      await get().fetchExercises();

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import exercises';
      set({ error: message, isImporting: false });
      throw error;
    }
  },

  exportExercisesToFile: async (request: ExerciseExportRequest) => {
    set({ isExporting: true, error: null, exportResult: null });
    try {
      const result = await exportExercises(request);
      set({ exportResult: result, isExporting: false });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export exercises';
      set({ error: message, isExporting: false });
      throw error;
    }
  },

  // UI state management
  setSearch: (search: string) => {
    set({ filters: { ...get().filters, search } });
  },

  setPage: (pageNumber: number, pageSize?: number) => {
    const currentPagination = get().pagination;
    if (currentPagination) {
      set({
        pagination: {
          ...currentPagination,
          pageNumber,
          pageSize: pageSize || currentPagination.pageSize,
        }
      });
    }
  },

  toggleSelect: (id: number) => {
    const selectedIds = get().selectedIds;
    const newSelectedIds = selectedIds.includes(id)
      ? selectedIds.filter(selectedId => selectedId !== id)
      : [...selectedIds, id];
    set({ selectedIds: newSelectedIds });
  },

  selectAll: (selectAll: boolean) => {
    const exercises = get().exercises;
    const newSelectedIds = selectAll ? exercises.map(exercise => exercise.id) : [];
    set({ selectedIds: newSelectedIds });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  clearFilters: () => {
    set({ filters: {
      availableTypes: [],
      availableLevels: [],
      totalCount: 0,
    } });
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
      exerciseVersions: [],
      exerciseAnalytics: null,
      exercisePreview: null,
      pagination: null,
      filters: {
    availableTypes: [],
    availableLevels: [],
    totalCount: 0,
  },
      selectedIds: [],
      isLoading: false,
      error: null,
      isImporting: false,
      importResult: null,
      isExporting: false,
      exportResult: null,
    });
  },
}));