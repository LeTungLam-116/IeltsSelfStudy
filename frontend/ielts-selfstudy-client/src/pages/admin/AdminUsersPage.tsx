import { useState, useEffect } from 'react';
import UserTable from './components/UserTable';
import Pagination from './components/Pagination';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import CreateUserModal from './components/CreateUserModal';
import EditUserModal from './components/EditUserModal';
import httpClient from '../../api/httpClient';

// Types matching backend DTOs exactly
export interface UserDto {
  id: number;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface PagedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PagedRequest {
  pageNumber: number;
  pageSize: number;
}

export default function AdminUsersPage() {
  const [usersResponse, setUsersResponse] = useState<PagedResponse<UserDto>>({
    items: [],
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  });

  // Safety check - ensure usersResponse always has valid structure
  const safeUsersResponse = usersResponse || {
    items: [],
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalUser, setDeleteModalUser] = useState<UserDto | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editModalUser, setEditModalUser] = useState<UserDto | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch users from backend API
  const fetchUsers = async (pageNumber: number = 1, pageSize: number = 10) => {
    try {
      setLoading(true);
      setError(null);

      const response = await httpClient.get<PagedResponse<UserDto>>('/users', {
        params: { pageNumber, pageSize }
      });

      // Handle both response formats:
      // 1. PagedResponse<T> when pagination params differ from defaults
      // 2. UserDto[] when pageNumber=1 and pageSize=10 (backend backward compatibility)
      let normalizedResponse: PagedResponse<UserDto>;

      if (Array.isArray(response.data)) {
        // Backend returned plain array (when pageNumber=1 and pageSize=10)
        normalizedResponse = {
          items: response.data,
          pageNumber: 1,
          pageSize: 10,
          totalCount: response.data.length,
          totalPages: Math.ceil(response.data.length / 10),
          hasPreviousPage: false,
          hasNextPage: response.data.length > 10
        };
      } else if (response.data && Array.isArray(response.data.items)) {
        // Backend returned PagedResponse
        normalizedResponse = response.data;
      } else {
        throw new Error('Invalid response format from backend');
      }
      setUsersResponse(normalizedResponse);
    } catch (err: any) {
      // Handle different error types
      if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
        // JWT interceptor will handle redirect to login
      } else if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Failed to load users. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: number) => {
    try {
      // Find the user to get current data
      const user = safeUsersResponse.items.find(u => u.id === userId);
      if (!user) return;

      // Call backend API to update user status
      await httpClient.put(`/users/${userId}`, {
        fullName: user.fullName,
        role: user.role,
        isActive: !user.isActive
      });

      // Re-fetch users to get updated data from backend
      await fetchUsers(safeUsersResponse.pageNumber, safeUsersResponse.pageSize);
    } catch (err) {
      console.error('Error toggling user status:', err);
      // In real implementation, show error toast
    }
  };

  const handleDeleteClick = (user: UserDto) => {
    setDeleteModalUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalUser) return;

    try {
      // Call backend API to delete user
      await httpClient.delete(`/users/${deleteModalUser.id}`);

      // Re-fetch users to get updated data from backend
      await fetchUsers(safeUsersResponse.pageNumber, safeUsersResponse.pageSize);

      setShowDeleteModal(false);
      setDeleteModalUser(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      // In real implementation, show error toast
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteModalUser(null);
  };

  const handleEditClick = (user: UserDto) => {
    setEditModalUser(user);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    // Re-fetch users to get updated data from backend
    fetchUsers(safeUsersResponse.pageNumber, safeUsersResponse.pageSize);
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page, safeUsersResponse.pageSize);
  };

  const handleRetry = () => {
    fetchUsers(safeUsersResponse.pageNumber, safeUsersResponse.pageSize);
  };

  const handleCreateSuccess = () => {
    // Re-fetch users to show the newly created user
    fetchUsers(safeUsersResponse.pageNumber, safeUsersResponse.pageSize);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <span className="mr-2">➕</span>
          Add User
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <span className="text-4xl">❌</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Users</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && (
        <>
          {(!safeUsersResponse.items || safeUsersResponse.items.length === 0) ? (
            <div className="bg-white rounded-lg shadow p-8">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <span className="text-4xl">👥</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                <p className="text-gray-600">There are no users to display.</p>
              </div>
            </div>
          ) : (
            <>
              <UserTable
                users={safeUsersResponse.items}
                onEdit={handleEditClick}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteClick}
              />

              <Pagination
                currentPage={safeUsersResponse.pageNumber}
                totalPages={safeUsersResponse.totalPages}
                totalCount={safeUsersResponse.totalCount}
                pageSize={safeUsersResponse.pageSize}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        user={deleteModalUser}
        isOpen={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit User Modal */}
      <EditUserModal
        user={editModalUser}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
