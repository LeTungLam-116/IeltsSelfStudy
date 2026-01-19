import { useState, useEffect } from 'react';
import { useExerciseStore } from '../../../stores';
import type { PagedRequest } from '../../../types/common';
import type { ExerciseFilters } from '../../../types/exercise';
import { Button, useToast } from '../../../components/ui';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { ExerciseTable } from './components/ExerciseTable';
import { ExerciseFormModal } from './components/ExerciseFormModal';
import { BulkToolbar } from '../components/BulkToolbar';
import { useNavigate } from 'react-router-dom';

export default function ExercisesListPage() {
  const exerciseStore = useExerciseStore();
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useToast();

  const {
    exercises,
    selectedIds,
    pagination,
    filters,
    isLoading,
    fetchExercises,
    setSearch,
    setPage,
    toggleSelect,
    selectAll,
    clearSelection,
    bulkActivate,
    bulkDeactivate,
    bulkDelete,
    createExercise,
    updateExercise,
    deleteExercise,
  } = exerciseStore;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<any>(null);

  // Load exercises when filters/pagination change
  useEffect(() => {
    const request: PagedRequest & ExerciseFilters = {
      pageNumber: pagination?.pageNumber || 1,
      pageSize: pagination?.pageSize || 10,
      search: filters?.search,
      sortBy: filters?.sortBy,
      sortDirection: filters?.sortDirection,
      types: filters?.types,
      levels: filters?.levels,
      isActive: filters?.isActive,
    };
    fetchExercises(request);
  }, [pagination?.pageNumber, pagination?.pageSize, filters?.search, filters?.sortBy, filters?.sortDirection, filters?.types, filters?.levels, filters?.isActive, fetchExercises]);

  const handleSearch = (search: string) => {
    setSearch(search);
    setPage(1, pagination?.pageSize || 10);
  };

  const handlePageChange = (page: number) => {
    setPage(page, pagination?.pageSize || 10);
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPage(1, pageSize);
  };

  const handleBulkActivate = async () => {
    try {
      await bulkActivate(selectedIds);
      showSuccess('Success', `${selectedIds.length} exercises activated successfully`);
    } catch (error) {
      console.error('Failed to bulk activate exercises:', error);
      showError('Error', 'Failed to activate exercises. Please try again.');
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      await bulkDeactivate(selectedIds);
      showSuccess('Success', `${selectedIds.length} exercises deactivated successfully`);
    } catch (error) {
      console.error('Failed to bulk deactivate exercises:', error);
      showError('Error', 'Failed to deactivate exercises. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} exercises? This action cannot be undone.`)) {
      try {
        await bulkDelete(selectedIds);
        showSuccess('Success', `${selectedIds.length} exercises deleted successfully`);
      } catch (error) {
        console.error('Failed to bulk delete exercises:', error);
        showError('Error', 'Failed to delete exercises. Please try again.');
      }
    }
  };

  const handleAddExerciseClick = () => {
    setShowCreateModal(true);
  };

  const handleEditExercise = (exercise: any) => {
    setEditingExercise(exercise);
  };

  const handleViewDetails = (exercise: any) => {
    navigate(`/admin/exercises/${exercise.id}`);
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    if (window.confirm('Are you sure you want to delete this exercise? This action cannot be undone.')) {
      try {
        await deleteExercise(exerciseId);
        showSuccess('Success', 'Exercise deleted successfully');
      } catch (error) {
        console.error('Failed to delete exercise:', error);
        showError('Error', 'Failed to delete exercise. Please try again.');
      }
    }
  };

  const handleCreateExercise = async (exerciseData: any) => {
    try {
      await createExercise(exerciseData);
      setShowCreateModal(false);
      showSuccess('Success', 'Exercise created successfully');
    } catch (error) {
      console.error('Failed to create exercise:', error);
      showError('Error', 'Failed to create exercise. Please try again.');
    }
  };

  const handleUpdateExercise = async (exerciseId: number, exerciseData: any) => {
    try {
      await updateExercise(exerciseId, exerciseData);
      setEditingExercise(null);
      showSuccess('Success', 'Exercise updated successfully');
    } catch (error) {
      console.error('Failed to update exercise:', error);
      showError('Error', 'Failed to update exercise. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exercise Management</h1>
          <p className="text-gray-600 mt-1">Create and manage IELTS exercises</p>
        </div>
        <Button onClick={handleAddExerciseClick}>
          Add Exercise
        </Button>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={filters?.search || ''}
        onChange={handleSearch}
        placeholder="Search exercises by title or description..."
      />

      {/* Bulk Toolbar */}
      <BulkToolbar
        selectedCount={selectedIds.length}
        onBulkActivate={handleBulkActivate}
        onBulkDeactivate={handleBulkDeactivate}
        onBulkDelete={handleBulkDelete}
        onClearSelection={clearSelection}
        isActivating={isLoading}
        isDeactivating={isLoading}
        isDeleting={isLoading}
        showActivateDeactivate={true}
      />

      {/* Exercises Table */}
      <ExerciseTable
        exercises={exercises}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onSelectAll={selectAll}
        onEditExercise={handleEditExercise}
        onDeleteExercise={handleDeleteExercise}
        onViewDetails={handleViewDetails}
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

      {/* Exercise Form Modal */}
      <ExerciseFormModal
        isOpen={showCreateModal || !!editingExercise}
        exercise={editingExercise}
        onClose={() => {
          setShowCreateModal(false);
          setEditingExercise(null);
        }}
        onSubmit={editingExercise ? (data) => handleUpdateExercise(editingExercise.id, data) : handleCreateExercise}
      />
    </div>
  );
}