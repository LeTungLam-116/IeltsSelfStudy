import { create } from 'zustand';
import type { AdminUser, CreateUserRequest, UpdateUserRequest, PagedUserResponse } from '../types/user';
import type { PagedRequest } from '../types/common';
import { getUsers, getUserById, createUser, updateUser, deleteUser, deleteUsers } from '../api/usersApi';

interface UserState {
  // State
  users: AdminUser[];
  currentUser: AdminUser | null;
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
  fetchUsers: (request?: PagedRequest) => Promise<void>;
  fetchUserById: (id: number) => Promise<AdminUser>;
  createUser: (request: CreateUserRequest) => Promise<AdminUser>;
  updateUser: (id: number, request: UpdateUserRequest) => Promise<AdminUser>;
  deleteUser: (id: number) => Promise<void>;
  bulkDelete: (ids: number[]) => Promise<void>;
  setFilters: (filters: { search?: string; sortBy?: string; sortDirection?: 'asc' | 'desc' }) => void;
  clearFilters: () => void;
  setSearch: (search: string) => void;
  setPage: (pageNumber: number, pageSize?: number) => void;
  toggleSelect: (id: number) => void;
  selectAll: (selectAll: boolean) => void;
  clearSelection: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  users: [],
  currentUser: null,
  pagination: null,
  filters: {},
  selectedIds: [],
  isLoading: false,
  error: null,

  // Actions
  createUser: async (request: CreateUserRequest) => {
    set({ isLoading: true, error: null });
    try {
      const user = await createUser(request);

      // Add to the users list if we're on the first page
      const currentUsers = get().users;
      if (get().pagination?.pageNumber === 1) {
        set({ users: [user, ...currentUsers], isLoading: false });
      } else {
        set({ isLoading: false });
      }
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create user';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateUser: async (id: number, request: UpdateUserRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await updateUser(id, request);

      // Update in the users list
      const currentUsers = get().users;
      const updatedUsers = currentUsers.map(user =>
        user.id === id ? updatedUser : user
      );
      set({
        users: updatedUsers,
        currentUser: get().currentUser?.id === id ? updatedUser : get().currentUser,
        isLoading: false,
      });
      return updatedUser;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update user';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteUser: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await deleteUser(id);

      // Remove from the users list
      const currentUsers = get().users;
      const filteredUsers = currentUsers.filter(user => user.id !== id);
      const currentPagination = get().pagination;
      if (currentPagination) {
        const newTotalCount = currentPagination.totalCount - 1;
        const newTotalPages = Math.ceil(newTotalCount / currentPagination.pageSize);
        set({
          users: filteredUsers,
          pagination: {
            ...currentPagination,
            totalCount: newTotalCount,
            totalPages: newTotalPages,
            hasNextPage: currentPagination.pageNumber < newTotalPages,
          },
          isLoading: false,
        });
      } else {
        set({ users: filteredUsers, isLoading: false });
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete user';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchUserById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const user = await getUserById(id);
      set({ currentUser: user, isLoading: false });
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch user';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchUsers: async (request?: PagedRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getUsers(request);

      // Handle both response formats from backend:
      // 1. Array (when pageNumber=1 and pageSize=10) - backward compatibility
      // 2. PagedResponse object (when pagination params differ)
      let normalizedResponse: PagedUserResponse;

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


      set({
        users: normalizedResponse.items,
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
      const message = error instanceof Error ? error.message : 'Failed to fetch users';
      set({ error: message, isLoading: false });
      throw error;
    }
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
    const users = get().users;
    const newSelectedIds = selectAll ? users.map(user => user.id) : [];
    set({ selectedIds: newSelectedIds });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  bulkDelete: async (ids: number[]) => {
    set({ isLoading: true, error: null });
    try {
      await deleteUsers(ids);

      // Remove from the users list
      const currentUsers = get().users;
      const filteredUsers = currentUsers.filter(user => !ids.includes(user.id));
      const currentPagination = get().pagination;
      if (currentPagination) {
        const newTotalCount = currentPagination.totalCount - ids.length;
        const newTotalPages = Math.ceil(newTotalCount / currentPagination.pageSize);
        set({
          users: filteredUsers,
          selectedIds: [],
          pagination: {
            ...currentPagination,
            totalCount: newTotalCount,
            totalPages: newTotalPages,
            hasNextPage: currentPagination.pageNumber < newTotalPages,
          },
          isLoading: false,
        });
      } else {
        set({ users: filteredUsers, selectedIds: [], isLoading: false });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete users';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  reset: () => {
    set({
      users: [],
      currentUser: null,
      pagination: null,
      filters: {},
      selectedIds: [],
      isLoading: false,
      error: null,
    });
  },
}));