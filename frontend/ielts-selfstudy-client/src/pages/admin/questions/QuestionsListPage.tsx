import { useState, useEffect, memo } from 'react';
import { Button, Card, Loading, useToast } from '../../../components/ui';
import { SearchBar, Pagination } from '../components';
import { QuestionTable } from './components/QuestionTable';
import { QuestionFormModal } from './components/QuestionFormModal';
import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionById
} from '../../../api/questionsApi';
import { useExerciseStore } from '../../../stores';
import type {
  QuestionDto,
  QuestionFilters,
  CreateQuestionRequest,
  UpdateQuestionRequest
} from '../../../types/questions';
import type { PagedRequest } from '../../../types/common';
import { IconPlus, IconFilter } from '../../../components/icons';

const QuestionsListPage = memo(function QuestionsListPage() {
  const { success: showSuccess, error: showError } = useToast();

  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [filters, setFilters] = useState<QuestionFilters>({
    search: '',
  });

  const [showFiltersOpen, setShowFiltersOpen] = useState<boolean>(false);
  const [localFilters, setLocalFilters] = useState<QuestionFilters>({ search: '' });

  // Keep localFilters in sync when applied filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const exerciseStore = useExerciseStore();
  const { fetchExerciseById, exercises } = exerciseStore;

  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionDto | null>(null);

  // Fetch questions when filters/pagination change
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);

        const request: PagedRequest = {
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize,
          search: filters.search,
        };

        const response: any = await getQuestions({ ...filters, ...request });

        // Support both PagedResponse and plain array responses.
        // Some environments (testing, older endpoints) may return a raw array.
        if (Array.isArray(response)) {
          setQuestions(response || []);
          setPagination({
            pageNumber: 1,
            pageSize: response.length || 10,
            totalCount: response.length || 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          });
        } else {
          setQuestions(response?.items || []);
          setPagination({
            pageNumber: response?.pageNumber || 1,
            pageSize: response?.pageSize || 10,
            totalCount: response?.totalCount || 0,
            totalPages: response?.totalPages || 1,
            hasNextPage: response?.hasNextPage || false,
            hasPreviousPage: response?.hasPreviousPage || false,
          });
        }
      } catch (err) {
        console.error('Failed to fetch questions:', err);
        showError('Error', 'Failed to load questions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [pagination.pageNumber, pagination.pageSize, filters, showError]);

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({
      ...prev,
      pageNumber: page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
  };

  const handleCreateQuestion = async (data: CreateQuestionRequest) => {
    try {
      const newQuestion = await createQuestion(data);
      setQuestions(prev => [newQuestion, ...prev]);
      setPagination(prev => ({
        ...prev,
        totalCount: prev.totalCount + 1,
      }));
      showSuccess('Success', 'Question created successfully!');
      // Refresh the exercise so questionCount and preview update
      try {
        await fetchExerciseById(data.exerciseId);
      } catch (err) {
        console.warn('Failed to refresh exercise after question create', err);
      }
    } catch (err) {
      console.error('Failed to create question:', err);
      showError('Error', 'Failed to create question. Please try again.');
      throw err; // Re-throw to let modal handle error state
    }
  };

  const handleEditQuestion = (question: QuestionDto) => {
    setEditingQuestion(question);
  };

  const handleUpdateQuestion = async (data: CreateQuestionRequest | UpdateQuestionRequest) => {
    if (!editingQuestion) return;

    try {
      const updateData = data as UpdateQuestionRequest;
      const updatedQuestion = await updateQuestion(editingQuestion.id, updateData);
      setQuestions(prev =>
        prev.map(q => q.id === editingQuestion.id ? updatedQuestion : q)
      );
      setEditingQuestion(null);
      showSuccess('Success', 'Question updated successfully!');
    } catch (err) {
      console.error('Failed to update question:', err);
      showError('Error', 'Failed to update question. Please try again.');
      throw err; // Re-throw to let modal handle error state
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    try {
      // Fetch the question to know which exercise to refresh after deletion
      let exerciseIdToRefresh: number | null = null;
      try {
        const q = await getQuestionById(id);
        exerciseIdToRefresh = q?.exerciseId ?? null;
      } catch (err) {
        console.warn('Could not fetch question before delete:', err);
      }

      await deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      setPagination(prev => ({
        ...prev,
        totalCount: prev.totalCount - 1,
      }));
      showSuccess('Success', 'Question deleted successfully!');

      if (exerciseIdToRefresh) {
        try {
          await fetchExerciseById(exerciseIdToRefresh);
        } catch (err) {
          console.warn('Failed to refresh exercise after question delete', err);
        }
      }
    } catch (err) {
      console.error('Failed to delete question:', err);
      showError('Error', 'Failed to delete question. Please try again.');
    }
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingQuestion(null);
  };

  if (isLoading && (!questions || questions.length === 0)) {
    return <Loading text="Loading questions..." />;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Questions Management</h1>
        <p className="text-gray-600 mt-2">Create and manage questions for exercises</p>
      </header>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <SearchBar
            value={filters.search || ''}
            onChange={handleSearch}
            placeholder="Search questions..."
          />

          <div className="flex gap-2 items-start">
            <div className="relative">
              <Button
                variant="secondary"
                className="flex items-center"
                onClick={() => setShowFiltersOpen((s) => !s)}
              >
                <IconFilter className="w-5 h-5 mr-2" />
                Filters
              </Button>

              {showFiltersOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-md shadow-lg p-4 z-50">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Exercise</label>
                      <select
                        value={filters.exerciseId ?? 0}
                        onChange={(e) => setLocalFilters(prev => ({ ...prev, exerciseId: Number(e.target.value) || undefined }))}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value={0}>All exercises</option>
                        {exercises && exercises.map(ex => (
                          <option key={ex.id} value={ex.id}>{ex.title} ({ex.type})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Skill</label>
                      <select
                        value={filters.skill ?? ''}
                        onChange={(e) => setLocalFilters(prev => ({ ...prev, skill: e.target.value || undefined }))}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="">Any</option>
                        <option value="Listening">Listening</option>
                        <option value="Reading">Reading</option>
                        <option value="Writing">Writing</option>
                        <option value="Speaking">Speaking</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Question Type</label>
                      <select
                        value={filters.questionType ?? ''}
                        onChange={(e) => setLocalFilters(prev => ({ ...prev, questionType: (e.target.value as unknown) as any || undefined }))}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="">Any</option>
                        <option value="MultipleChoice">Multiple Choice</option>
                        <option value="FillBlank">Fill in the Blank</option>
                        <option value="Essay">Essay</option>
                        <option value="TrueFalse">True/False</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                      <select
                        value={filters.isActive === undefined ? '' : filters.isActive ? 'active' : 'inactive'}
                        onChange={(e) => {
                          const v = e.target.value;
                          setLocalFilters(prev => ({ ...prev, isActive: v === '' ? undefined : v === 'active' }));
                        }}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="">Any</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        className="px-3 py-1 border rounded text-sm"
                        onClick={() => {
                          setFilters({ search: '' });
                          setPagination(prev => ({ ...prev, pageNumber: 1 }));
                          setShowFiltersOpen(false);
                        }}
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                        onClick={() => {
                          setFilters(localFilters);
                          setPagination(prev => ({ ...prev, pageNumber: 1 }));
                          setShowFiltersOpen(false);
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button onClick={() => setShowCreateModal(true)} className="flex items-center">
              <IconPlus className="w-5 h-5 mr-2" />
              Add Question
            </Button>
          </div>
        </div>

        <QuestionTable
          questions={questions}
          onEdit={handleEditQuestion}
          onDelete={handleDeleteQuestion}
          isLoading={isLoading}
        />

        {pagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={pagination.pageNumber}
              totalPages={pagination.totalPages}
              pageSize={pagination.pageSize}
              totalCount={pagination.totalCount}
              onPageChange={handlePageChange}
              onPageSizeChange={(pageSize: number) => handlePageChange(1, pageSize)}
            />
          </div>
        )}
      </Card>

      {/* Create Modal */}
      <QuestionFormModal
        isOpen={showCreateModal}
        onClose={handleModalClose}
        onSubmit={handleCreateQuestion}
      />

      {/* Edit Modal */}
      <QuestionFormModal
        isOpen={!!editingQuestion}
        question={editingQuestion}
        onClose={handleModalClose}
        onSubmit={handleUpdateQuestion}
      />
    </div>
  );
});

QuestionsListPage.displayName = 'QuestionsListPage';

export default QuestionsListPage;
