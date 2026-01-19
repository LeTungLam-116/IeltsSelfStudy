import { create } from 'zustand';
import type {
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseExercise,
  AddExerciseToCourseRequest,
  PagedCourseResponse
} from '../types/course';
import type { PagedRequest } from '../types/common';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseExercises,
  addExerciseToCourse,
  removeExerciseFromCourse,
  updateExerciseOrder
} from '../api/coursesApi';

interface CourseState {
  // State
  courses: Course[];
  currentCourse: Course | null;
  courseExercises: CourseExercise[];
  pagination: {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
  filters: {
    search?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  };
  selectedIds: number[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCourses: (request?: PagedRequest) => Promise<void>;
  fetchCourseById: (id: number) => Promise<Course>;
  createCourse: (request: CreateCourseRequest) => Promise<Course>;
  updateCourse: (id: number, request: UpdateCourseRequest) => Promise<Course>;
  deleteCourse: (id: number) => Promise<void>;
  bulkDelete: (ids: number[]) => Promise<void>;
  setFilters: (filters: { search?: string; sortBy?: string; sortDirection?: 'asc' | 'desc' }) => void;
  clearFilters: () => void;
  setSearch: (search: string) => void;
  setPage: (pageNumber: number, pageSize?: number) => void;
  toggleSelect: (id: number) => void;
  selectAll: (selectAll: boolean) => void;
  clearSelection: () => void;

  // Course exercise actions
  fetchCourseExercises: (courseId: number) => Promise<CourseExercise[]>;
  addExerciseToCourse: (courseId: number, request: AddExerciseToCourseRequest) => Promise<CourseExercise>;
  removeExerciseFromCourse: (courseId: number, courseExerciseId: number) => Promise<void>;
  updateExerciseOrder: (courseId: number, courseExerciseId: number, newOrder: number) => Promise<void>;

  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  // Initial state
  courses: [],
  currentCourse: null,
  courseExercises: [],
  pagination: null,
  filters: {},
  selectedIds: [],
  isLoading: false,
  error: null,

  // Actions
  createCourse: async (request: CreateCourseRequest) => {
    set({ isLoading: true, error: null });
    try {
      const course = await createCourse(request);
      console.log('courseStore - createCourse success:', course);

      // Add to the courses list if we're on the first page
      const currentCourses = get().courses;
      if (get().pagination?.pageNumber === 1) {
        set({ courses: [course, ...currentCourses], isLoading: false });
      } else {
        set({ isLoading: false });
      }
      return course;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create course';
      console.error('courseStore - createCourse error:', error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateCourse: async (id: number, request: UpdateCourseRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCourse = await updateCourse(id, request);
      console.log('courseStore - updateCourse success:', updatedCourse);

      // Update in the courses list
      const currentCourses = get().courses;
      const updatedCourses = currentCourses.map(course =>
        course.id === id ? updatedCourse : course
      );
      set({
        courses: updatedCourses,
        currentCourse: get().currentCourse?.id === id ? updatedCourse : get().currentCourse,
        isLoading: false,
      });
      return updatedCourse;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update course';
      console.error('courseStore - updateCourse error:', error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteCourse: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await deleteCourse(id);
      console.log('courseStore - deleteCourse success');

      // Remove from the courses list
      const currentCourses = get().courses;
      const filteredCourses = currentCourses.filter(course => course.id !== id);
      const currentPagination = get().pagination;
      if (currentPagination) {
        set({
          courses: filteredCourses,
          isLoading: false,
        });
      } else {
        set({ courses: filteredCourses, isLoading: false });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete course';
      console.error('courseStore - deleteCourse error:', error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  bulkDelete: async (ids: number[]) => {
    set({ isLoading: true, error: null });
    try {
      // For now, delete one by one. In a real app, you'd have a bulk delete endpoint
      await Promise.all(ids.map(id => deleteCourse(id)));

      // Remove from the courses list
      const currentCourses = get().courses;
      const filteredCourses = currentCourses.filter(course => !ids.includes(course.id));
      const currentPagination = get().pagination;
      if (currentPagination) {
        const newTotalCount = currentPagination.totalCount - ids.length;
        set({
          courses: filteredCourses,
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
        set({ courses: filteredCourses, selectedIds: [], isLoading: false });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete courses';
      console.error('courseStore - bulkDelete error:', error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchCourseById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const course = await getCourseById(id);
      set({ currentCourse: course, isLoading: false });
      return course;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch course';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchCourses: async (request?: PagedRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getCourses(request);

      // Handle both response formats from backend:
      // 1. Array (when pageNumber=1 and pageSize=10) - backward compatibility
      // 2. PagedResponse object (when pagination params differ)
      let normalizedResponse: PagedCourseResponse;

      if (Array.isArray(response)) {
        // Backend returned plain array (when pageNumber=1 and pageSize=10)
        normalizedResponse = {
          items: response,
          pageNumber: request?.pageNumber || 1,
          pageSize: request?.pageSize || 10,
          totalCount: response.length,
          totalPages: Math.ceil(response.length / (request?.pageSize || 10)),
          hasPreviousPage: (request?.pageNumber || 1) > 1,
          hasNextPage: response.length > ((request?.pageNumber || 1) * (request?.pageSize || 10))
        };
      } else if (response && Array.isArray(response.items)) {
        // Backend returned PagedResponse object
        normalizedResponse = response;
      } else {
        throw new Error('Invalid response format from backend');
      }

      console.log('courseStore - fetchCourses success:', {
        responseType: Array.isArray(response) ? 'array' : 'object',
        itemsCount: normalizedResponse.items.length,
        totalCount: normalizedResponse.totalCount,
        courses: normalizedResponse.items
      });

      set({
        courses: normalizedResponse.items,
        pagination: {
          totalCount: normalizedResponse.totalCount,
          pageNumber: normalizedResponse.pageNumber,
          pageSize: normalizedResponse.pageSize,
          totalPages: normalizedResponse.totalPages,
          hasNextPage: normalizedResponse.hasNextPage,
          hasPreviousPage: normalizedResponse.hasPreviousPage,
        },
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch courses';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Course exercise actions
  fetchCourseExercises: async (courseId: number) => {
    set({ isLoading: true, error: null });
    try {
      const exercises = await getCourseExercises(courseId);
      set({ courseExercises: exercises, isLoading: false });
      return exercises;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch course exercises';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  addExerciseToCourse: async (courseId: number, request: AddExerciseToCourseRequest) => {
    set({ isLoading: true, error: null });
    try {
      const courseExercise = await addExerciseToCourse(courseId, request);

      // Add to current course exercises list
      const currentExercises = get().courseExercises;
      const updatedExercises = [...currentExercises, courseExercise];
      set({ courseExercises: updatedExercises, isLoading: false });

      return courseExercise;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add exercise to course';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  removeExerciseFromCourse: async (courseId: number, courseExerciseId: number) => {
    set({ isLoading: true, error: null });
    try {
      await removeExerciseFromCourse(courseId, courseExerciseId);

      // Remove from current course exercises list
      const currentExercises = get().courseExercises;
      const updatedExercises = currentExercises.filter(ex => ex.id !== courseExerciseId);
      set({ courseExercises: updatedExercises, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove exercise from course';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateExerciseOrder: async (courseId: number, courseExerciseId: number, newOrder: number) => {
    set({ isLoading: true, error: null });
    try {
      await updateExerciseOrder(courseId, courseExerciseId, newOrder);

      // Update order in current course exercises list
      const currentExercises = get().courseExercises;
      const updatedExercises = currentExercises.map(ex =>
        ex.id === courseExerciseId ? { ...ex, order: newOrder } : ex
      );
      set({ courseExercises: updatedExercises, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update exercise order';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

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
    const courses = get().courses;
    const newSelectedIds = selectAll ? courses.map(course => course.id) : [];
    set({ selectedIds: newSelectedIds });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  setFilters: (filters) => {
    set({ filters });
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      courses: [],
      currentCourse: null,
      courseExercises: [],
      pagination: null,
      filters: {},
      selectedIds: [],
      isLoading: false,
      error: null,
    });
  },
}));
