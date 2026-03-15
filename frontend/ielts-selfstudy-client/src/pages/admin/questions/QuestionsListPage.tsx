import { useState, useEffect, memo, useRef, useMemo } from 'react';
import { Button, Card, Loading, useToast } from '../../../components/ui';
import { SearchBar, Pagination } from '../components';
import { QuestionTable } from './components/QuestionTable';
import { QuestionFormModal } from './components/QuestionFormModal';
import { ImportExcelModal } from './components/ImportExcelModal';
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

  const exerciseStore = useExerciseStore();
  const { fetchExerciseById, exercises, fetchExercises } = exerciseStore;

  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionDto | null>(null);

  // Ref để đóng filter dropdown khi click ra ngoài
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFiltersOpen(false);
      }
    };
    if (showFiltersOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFiltersOpen]);

  // Fetch initial exercises for filter dropdown
  useEffect(() => {
    if (exercises.length === 0) {
      fetchExercises({ pageNumber: 1, pageSize: 100 });
    }
  }, [exercises.length, fetchExercises]);

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
        const rawItems: QuestionDto[] = Array.isArray(response) ? response : (response?.items || []);

        if (Array.isArray(response)) {
          setQuestions(rawItems);
          setPagination({
            pageNumber: 1,
            pageSize: rawItems.length || 10,
            totalCount: rawItems.length || 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          });
        } else {
          setQuestions(rawItems);
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
        showError('Lỗi', 'Không thể tải danh sách câu hỏi. Vui lòng thử lại.');
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
      showSuccess('Thành công', 'Đã tạo câu hỏi mới!');
      // Refresh the exercise so questionCount and preview update
      try {
        await fetchExerciseById(data.exerciseId);
      } catch (err) {
        console.warn('Failed to refresh exercise after question create', err);
      }
    } catch (err) {
      console.error('Failed to create question:', err);
      showError('Lỗi', 'Không thể tạo câu hỏi. Vui lòng thử lại.');
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
      showSuccess('Thành công', 'Đã cập nhật câu hỏi!');
    } catch (err) {
      console.error('Failed to update question:', err);
      showError('Lỗi', 'Không thể cập nhật câu hỏi. Vui lòng thử lại.');
      throw err; // Re-throw to let modal handle error state
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này? Thao tác này không thể hoàn tác.')) {
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
      showSuccess('Thành công', 'Đã xóa câu hỏi!');

      if (exerciseIdToRefresh) {
        try {
          await fetchExerciseById(exerciseIdToRefresh);
        } catch (err) {
          console.warn('Failed to refresh exercise after question delete', err);
        }
      }
    } catch (err) {
      console.error('Failed to delete question:', err);
      showError('Lỗi', 'Không thể xóa câu hỏi. Vui lòng thử lại.');
    }
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingQuestion(null);
  };

  // Join tên bài tập từ store vào từng câu hỏi — giúp bảng hiển thị "Tên bài tập" rõ ràng thay vì chỉ là ID số
  const questionsWithTitle = useMemo(() => {
    if (!exercises || exercises.length === 0) return questions;
    const exerciseMap = new Map(exercises.map(ex => [ex.id, ex.title]));
    return questions.map(q => ({
      ...q,
      exerciseTitle: exerciseMap.get(q.exerciseId) ?? `Bài tập #${q.exerciseId}`,
    }));
  }, [questions, exercises]);

  if (isLoading && (!questions || questions.length === 0)) {
    return <Loading text="Đang tải danh sách câu hỏi..." />;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý câu hỏi</h1>
        <p className="text-gray-600 mt-2">Tạo và quản lý câu hỏi cho các bài tập</p>
      </header>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <SearchBar
            value={filters.search || ''}
            onChange={handleSearch}
            placeholder="Tìm kiếm câu hỏi..."
          />

          <div className="flex gap-2 items-start">
            <div className="relative" ref={filterRef}>
              <Button
                variant="secondary"
                className="flex items-center"
                onClick={() => setShowFiltersOpen((s) => !s)}
              >
                <IconFilter className="w-5 h-5 mr-2" />
                Bộ lọc
              </Button>

              {showFiltersOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-md shadow-lg p-4 z-50">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Bài tập</label>
                      <select
                        value={localFilters.exerciseId ?? 0}
                        onChange={(e) => setLocalFilters(prev => ({ ...prev, exerciseId: Number(e.target.value) || undefined }))}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value={0}>Tất cả bài tập</option>
                        {exercises && exercises.map(ex => (
                          <option key={ex.id} value={ex.id}>{ex.title} ({ex.type})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Kỹ năng</label>
                      <select
                        value={localFilters.skill ?? ''}
                        onChange={(e) => setLocalFilters(prev => ({ ...prev, skill: e.target.value || undefined }))}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="">Tất cả</option>
                        <option value="Listening">Listening</option>
                        <option value="Reading">Reading</option>
                        <option value="Writing">Writing</option>
                        <option value="Speaking">Speaking</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Loại câu hỏi</label>
                      <select
                        value={localFilters.questionType ?? ''}
                        onChange={(e) => setLocalFilters(prev => ({ ...prev, questionType: (e.target.value as unknown) as any || undefined }))}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="">Tất cả</option>
                        <option value="MultipleChoice">Trắc nghiệm</option>
                        <option value="FillBlank">Điền vào chỗ trống</option>
                        <option value="Essay">Tự luận</option>
                        <option value="TrueFalse">Đúng/Sai</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Trạng thái</label>
                      <select
                        value={localFilters.isActive === undefined ? '' : localFilters.isActive ? 'active' : 'inactive'}
                        onChange={(e) => {
                          const v = e.target.value;
                          setLocalFilters(prev => ({ ...prev, isActive: v === '' ? undefined : v === 'active' }));
                        }}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="">Tất cả</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="inactive">Ngưng hoạt động</option>
                      </select>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        className="px-3 py-1 border rounded text-sm hover:bg-slate-50 transition-colors"
                        onClick={() => {
                          const resetFilters = { search: '' };
                          setFilters(resetFilters);
                          setLocalFilters(resetFilters);
                          setPagination(prev => ({ ...prev, pageNumber: 1 }));
                          setShowFiltersOpen(false);
                        }}
                      >
                        Xóa lọc
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors shadow-sm"
                        onClick={() => {
                          setFilters(localFilters);
                          setPagination(prev => ({ ...prev, pageNumber: 1 }));
                          setShowFiltersOpen(false);
                        }}
                      >
                        Áp dụng
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button variant="secondary" onClick={() => setShowImportModal(true)} className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Nhập từ Excel
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center">
              <IconPlus className="w-5 h-5 mr-2" />
              Thêm câu hỏi
            </Button>
          </div>
        </div>

        <QuestionTable
          questions={questionsWithTitle}
          onEdit={handleEditQuestion}
          onDelete={handleDeleteQuestion}
          isLoading={isLoading}
        />

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

      {/* Import Modal */}
      <ImportExcelModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          setPagination(prev => ({ ...prev, pageNumber: 1 }));
        }}
      />
    </div>
  );
});

QuestionsListPage.displayName = 'QuestionsListPage';

export default QuestionsListPage;
