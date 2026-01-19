import { useState, useEffect } from 'react';
import { useCourseStore } from '../../../stores';
import type { PagedRequest } from '../../../types/common';
import { Button, useToast } from '../../../components/ui';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { CourseTable } from './components/CourseTable';
import { CourseFormModal } from './components/CourseFormModal';
import { CourseEditorModal } from './components/CourseEditorModal';
import { BulkToolbar } from '../components/BulkToolbar';

export default function CoursesListPage() {
  const courseStore = useCourseStore();
  const { error: showError, success: showSuccess } = useToast();
  const {
    courses,
    selectedIds,
    pagination,
    filters,
    isLoading,
    fetchCourses,
    setSearch,
    setPage,
    toggleSelect,
    selectAll,
    clearSelection,
    bulkDelete
  } = courseStore;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [editingExercisesCourse, setEditingExercisesCourse] = useState<any>(null);

  // Load courses when filters/pagination change
  useEffect(() => {
    const request: PagedRequest = {
      pageNumber: pagination?.pageNumber || 1,
      pageSize: pagination?.pageSize || 10,
      search: filters?.search,
      sortBy: filters?.sortBy,
      sortDirection: filters?.sortDirection,
    };
    fetchCourses(request);
  }, [pagination?.pageNumber, pagination?.pageSize, filters?.search, filters?.sortBy, filters?.sortDirection, fetchCourses]);

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

  const handleBulkDelete = async () => {
    try {
      await bulkDelete(selectedIds);
      showSuccess('Success', `${selectedIds.length} courses deleted successfully`);
    } catch (error) {
      console.error('Failed to bulk delete courses:', error);
      showError('Error', 'Failed to delete courses. Please try again.');
    }
  };

  const handleAddCourseClick = () => {
    setShowCreateModal(true);
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
  };

  const handleEditExercises = async (course: any) => {
    try {
      // Fetch the course with exercises populated
      const courseWithExercises = await courseStore.fetchCourseById(course.id);
      // Ensure exercises are loaded
      await courseStore.fetchCourseExercises(course.id);
      setEditingExercisesCourse(courseWithExercises);
    } catch (error) {
      console.error('Failed to load course exercises:', error);
    }
  };

  const handleSaveExercises = async (courseId: number, updatedExercises: any[]) => {
    try {
      // Get the original exercises for this course
      const originalExercises = await courseStore.fetchCourseExercises(courseId);

      // Determine what operations to perform
      const operations = compareExercises(originalExercises, updatedExercises);

      // Execute operations in order
      for (const operation of operations) {
        switch (operation.type) {
          case 'add':
            await courseStore.addExerciseToCourse(courseId, {
              exerciseId: operation.exercise.exerciseId,
              order: operation.exercise.order,
              lessonNumber: operation.exercise.lessonNumber,
            });
            break;
          case 'remove':
            await courseStore.removeExerciseFromCourse(courseId, operation.exerciseId);
            break;
          case 'reorder':
            await courseStore.updateExerciseOrder(courseId, operation.exerciseId, operation.newOrder);
            break;
        }
      }

      console.log(`Successfully saved exercises for course ${courseId}`);
      setEditingExercisesCourse(null);

      // Refresh the course data to reflect changes
      await courseStore.fetchCourses();
      showSuccess('Success', 'Course exercises updated successfully');
    } catch (error) {
      console.error('Failed to save course exercises:', error);
      showError('Error', 'Failed to save course exercises. Please try again.');
    }
  };

  const compareExercises = (original: any[], updated: any[]) => {
    const operations: any[] = [];

    // Create maps for easier lookup
    const originalMap = new Map(original.map(ex => [ex.id, ex]));
    const updatedMap = new Map(updated.map(ex => [ex.id, ex]));

    // Find removed exercises
    for (const originalEx of original) {
      if (!updatedMap.has(originalEx.id)) {
        operations.push({
          type: 'remove',
          exerciseId: originalEx.id,
        });
      }
    }

    // Find added exercises
    for (const updatedEx of updated) {
      if (!originalMap.has(updatedEx.id)) {
        operations.push({
          type: 'add',
          exercise: updatedEx,
        });
      } else {
        // Check for reordering
        const originalEx = originalMap.get(updatedEx.id);
        if (originalEx && originalEx.order !== updatedEx.order) {
          operations.push({
            type: 'reorder',
            exerciseId: updatedEx.id,
            newOrder: updatedEx.order,
          });
        }
      }
    }

    return operations;
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseStore.deleteCourse(courseId);
      } catch (error) {
        console.error('Failed to delete course:', error);
      }
    }
  };

  const handleCreateCourse = async (courseData: any) => {
    try {
      await courseStore.createCourse(courseData);
      setShowCreateModal(false);
      showSuccess('Success', 'Course created successfully');
    } catch (error) {
      console.error('Failed to create course:', error);
      showError('Error', 'Failed to create course. Please try again.');
    }
  };

  const handleUpdateCourse = async (courseId: number, courseData: any) => {
    try {
      await courseStore.updateCourse(courseId, courseData);
      setEditingCourse(null);
      showSuccess('Success', 'Course updated successfully');
    } catch (error) {
      console.error('Failed to update course:', error);
      showError('Error', 'Failed to update course. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-1">Create and manage IELTS courses</p>
        </div>
        <Button onClick={handleAddCourseClick}>
          Add Course
        </Button>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={filters?.search || ''}
        onChange={handleSearch}
        placeholder="Search courses by name or description..."
      />

      {/* Bulk Toolbar */}
      <BulkToolbar
        selectedCount={selectedIds.length}
        onBulkDelete={handleBulkDelete}
        onClearSelection={clearSelection}
        isDeleting={isLoading}
      />

      {/* Courses Table */}
      <CourseTable
        courses={courses}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onSelectAll={selectAll}
        onEditCourse={handleEditCourse}
        onEditExercises={handleEditExercises}
        onDeleteCourse={handleDeleteCourse}
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

      {/* Course Form Modal */}
      <CourseFormModal
        isOpen={showCreateModal || !!editingCourse}
        course={editingCourse}
        onClose={() => {
          setShowCreateModal(false);
          setEditingCourse(null);
        }}
        onSubmit={editingCourse ? (data) => handleUpdateCourse(editingCourse.id, data) : handleCreateCourse}
      />

      {/* Course Editor Modal */}
      <CourseEditorModal
        isOpen={!!editingExercisesCourse}
        course={editingExercisesCourse}
        onClose={() => setEditingExercisesCourse(null)}
        onSave={handleSaveExercises}
      />
    </div>
  );
}
