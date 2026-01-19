// User-related types for admin management

export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  role: string;
  targetBand?: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
  password: string;
  role?: string;
  targetBand?: number | null;
}

export interface UpdateUserRequest {
  fullName: string;
  role: string;
  targetBand?: number | null;
  isActive: boolean;
}

export interface PagedUserResponse {
  items: AdminUser[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Form data types for admin UI
export interface UserFormData {
  email: string;
  fullName: string;
  password?: string; // Only required for create
  confirmPassword?: string; // For validation
  role: string;
  targetBand?: number | null;
  isActive: boolean;
}

// User roles
export const USER_ROLES = ['Student', 'Admin'] as const;
export type UserRole = typeof USER_ROLES[number];

// User table filters
export interface UserFilters {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  sortBy?: 'id' | 'email' | 'fullName' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
}
