import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconRefresh } from '../../../components/icons';
import { Button, Loading, Card, Badge } from '../../../components/ui';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import AttemptTable from './components/AttemptTable';
import { getAttempts } from '../../../api/attemptsApi';
import type { AttemptDto, AttemptFiltersDto } from '../../../types/attempts';

const AttemptsListPage = memo(function AttemptsListPage() {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState<AttemptDto[]>([]);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [filters, setFilters] = useState<AttemptFiltersDto>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');

  // Fetch attempts when filters or pagination change
  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getAttempts({
          ...filters,
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize,
        });

        setAttempts(response.items);
        setPagination({
          pageNumber: response.pageNumber,
          pageSize: response.pageSize,
          totalCount: response.totalCount,
          totalPages: response.totalPages,
          hasNextPage: response.hasNextPage,
          hasPreviousPage: response.hasPreviousPage,
        });
      } catch (err) {
        console.error('Failed to fetch attempts:', err);
        setError('Không thể tải danh sách lượt làm bài. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttempts();
  }, [pagination.pageNumber, pagination.pageSize, filters]);

  const handleSearchChange = (search: string) => {
    setSearchValue(search);
    // For now, we'll treat search as user name or email search
    // In a more advanced implementation, this could search across multiple fields
    setFilters(prev => ({ ...prev, userId: undefined })); // Reset userId filter
    // Note: The backend would need to be updated to support general search
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({
      ...prev,
      pageNumber: page,
    }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      pageSize,
      pageNumber: 1, // Reset to first page when changing page size
    }));
  };

  const handleViewDetails = (attempt: AttemptDto) => {
    navigate(`/admin/attempts/${attempt.id}`);
  };

  const handleGrade = (attempt: AttemptDto) => {
    navigate(`/admin/attempts/${attempt.id}/grade`);
  };

  const handleFilterChange = (newFilters: Partial<AttemptFiltersDto>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
  };

  if (isLoading && attempts.length === 0) {
    return <Loading text="Đang tải danh sách lượt làm bài..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý lượt làm bài</h1>
        <p className="text-gray-600 mt-2">
          Xem xét và chấm điểm các lượt làm bài của người dùng
        </p>
      </header>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
          <div className="w-full md:w-96">
            <SearchBar
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Tìm theo tên hoặc email người dùng..."
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative group">
              <Button
                variant="secondary"
                className="flex items-center w-full md:w-auto"
                onClick={() => handleResetFilters()}
              >
                <IconRefresh className="w-4 h-4 mr-2" />
                Làm mới
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Kỹ năng</label>
            <select
              value={filters.skill || ''}
              onChange={(e) => handleFilterChange({ skill: e.target.value || undefined })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            >
              <option value="">Tất cả kỹ năng</option>
              <option value="Listening">Nghe (Listening)</option>
              <option value="Reading">Đọc (Reading)</option>
              <option value="Writing">Viết (Writing)</option>
              <option value="Speaking">Nói (Speaking)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Trạng thái</label>
            <select
              value={filters.isGraded?.toString() || ''}
              onChange={(e) => handleFilterChange({
                isGraded: e.target.value ? e.target.value === 'true' : undefined
              })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="false">Chờ chấm điểm</option>
              <option value="true">Đã chấm điểm</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Sắp xếp theo</label>
            <select
              value={filters.sortBy || 'CreatedAt'}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            >
              <option value="CreatedAt">Mới nhất trước</option>
              <option value="UserName">Tên người dùng</option>
              <option value="Score">Điểm số</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-slate-500 font-medium">
            Hiển thị <span className="text-slate-900 font-bold">{attempts.length}</span> trên <span className="text-slate-900 font-bold">{pagination.totalCount}</span> lượt làm bài
          </p>
          {filters.skill && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100">
              Kỹ năng: {filters.skill}
            </Badge>
          )}
          {filters.isGraded !== undefined && (
            <Badge variant="secondary" className={filters.isGraded ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}>
              Trạng thái: {filters.isGraded ? 'Đã chấm' : 'Chờ chấm'}
            </Badge>
          )}
        </div>

        {isLoading && <Loading size="sm" />}
      </div>

      {/* Error State */}
      {error && (
        <Card className="bg-red-50 border-red-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <IconRefresh className="w-5 h-5 animate-spin-reverse" />
            </div>
            <div className="flex-1">
              <p className="text-red-800 font-bold">Đã xảy ra lỗi!</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="bg-white border-red-200 text-red-600 hover:bg-red-50"
            >
              Thử lại
            </Button>
          </div>
        </Card>
      )}

      {/* Attempts Table */}
      <Card className="overflow-hidden border-none shadow-xl">
        <AttemptTable
          attempts={attempts}
          onViewDetails={handleViewDetails}
          onGrade={handleGrade}
        />
      </Card>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.pageNumber}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
        totalCount={pagination.totalCount}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
});

AttemptsListPage.displayName = 'AttemptsListPage';

export default AttemptsListPage;
