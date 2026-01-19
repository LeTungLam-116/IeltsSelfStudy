import { useState, useEffect } from 'react';
import { useUserStore } from '../../stores';
import type { AdminUser, PagedRequest } from '../../types';
import { Button, useToast } from '../../components/ui';
import { CreateEditUserModal } from './components/CreateEditUserModal';
import { SearchBar } from './components/SearchBar';
import { Pagination } from './components/Pagination';
import { UserTable } from './components/UserTable';
import { BulkToolbar } from './components/BulkToolbar';

export default function AdminUsersPage() {
  const storeState = useUserStore();
  const { error: showError, success: showSuccess } = useToast();

  const {
    users = [],
    selectedIds = [],
    pagination,
    filters,
    isLoading = false,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    bulkDelete,
    setSearch,
    setPage,
    toggleSelect,
    selectAll,
    clearSelection
  } = storeState;


  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Load users when filters change
  useEffect(() => {
    const request: PagedRequest = {
      pageNumber: pagination?.pageNumber || 1,
      pageSize: pagination?.pageSize || 10,
      search: filters?.search,
      sortBy: filters?.sortBy,
      sortDirection: filters?.sortDirection,
    };
    fetchUsers(request);
  }, [pagination?.pageNumber, pagination?.pageSize, filters?.search, filters?.sortBy, filters?.sortDirection, fetchUsers]);

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        // Store will automatically update, no need to manually refresh
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleSearch = (search: string) => {
    setSearch(search);
    setPage(1, pagination?.pageSize || 10); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setPage(page, pagination?.pageSize || 10);
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPage(1, pageSize); // Reset to first page when changing page size
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDelete(selectedIds);
      showSuccess('Success', `${selectedIds.length} users deleted successfully`);
      clearSelection();
    } catch (error) {
      console.error('Failed to bulk delete users:', error);
      showError('Error', 'Failed to delete users. Please try again.');
    }
  };

  const handleAddUserClick = () => {
    setShowCreateModal(true);
  };


  const handleCreateUser = async (userData: any) => {
    console.log('AdminUsersPage - handleCreateUser called with:', userData);
    try {
      await createUser(userData);
      console.log('AdminUsersPage - createUser success');
      setShowCreateModal(false);
      showSuccess('Success', 'User created successfully');
      // Refresh the user list
      const request: PagedRequest = {
        pageNumber: 1,
        pageSize: 10,
      };
      await fetchUsers(request);
    } catch (error) {
      console.error('Failed to create user:', error);
      showError('Error', 'Failed to create user. Please try again.');
    }
  };

  const handleUpdateUser = async (userId: number, userData: any) => {
    console.log('AdminUsersPage - handleUpdateUser called with:', userId, userData);
    try {
      await updateUser(userId, userData);
      console.log('AdminUsersPage - updateUser success');
      setEditingUser(null);
      showSuccess('Success', 'User updated successfully');
    } catch (error) {
      console.error('Failed to update user:', error);
      showError('Error', 'Failed to update user. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
        </div>
        <Button onClick={handleAddUserClick}>
          Add User
        </Button>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={filters?.search || ''}
        onChange={handleSearch}
        placeholder="Search users by name or email..."
      />

      {/* Bulk Toolbar */}
      <BulkToolbar
        selectedCount={selectedIds.length}
        onBulkDelete={handleBulkDelete}
        onClearSelection={clearSelection}
        isDeleting={isLoading}
      />

      {/* Users Table */}
      <UserTable
        users={users}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onSelectAll={selectAll}
        onEditUser={setEditingUser}
        onDeleteUser={handleDeleteUser}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {pagination && (
        <Pagination
          currentPage={pagination.pageNumber}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          totalCount={pagination.totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <CreateEditUserModal
        isOpen={showCreateModal || !!editingUser}
        user={editingUser}
        onClose={() => {
          setShowCreateModal(false);
          setEditingUser(null);
        }}
        onSubmit={editingUser ? (data) => handleUpdateUser(editingUser.id, data) : handleCreateUser}
      />
    </div>
  );
}