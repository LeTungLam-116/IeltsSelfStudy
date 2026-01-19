import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconFilter } from '../../../components/icons';
import { Button, Loading } from '../../../components/ui';
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
        setError('Failed to load attempts. Please try again.');
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
    return (
      <main className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Attempts Management</h1>
          <p className="text-gray-600 mt-2">Loading attempts...</p>
        </header>
        <Loading />
      </main>
    );
  }

  return (
    <main className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Attempts Management</h1>
        <p className="text-gray-600 mt-2">
          Review and grade user attempts across all exercises and skills
        </p>
      </header>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search by user name or email..."
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleResetFilters}>
              <IconFilter className="w-4 h-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          <select
            value={filters.skill || ''}
            onChange={(e) => handleFilterChange({ skill: e.target.value || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Skills</option>
            <option value="Listening">Listening</option>
            <option value="Reading">Reading</option>
            <option value="Writing">Writing</option>
            <option value="Speaking">Speaking</option>
          </select>

          <select
            value={filters.isGraded?.toString() || ''}
            onChange={(e) => handleFilterChange({
              isGraded: e.target.value ? e.target.value === 'true' : undefined
            })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="false">Pending</option>
            <option value="true">Graded</option>
          </select>

          <select
            value={filters.sortBy || 'CreatedAt'}
            onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="CreatedAt">Newest First</option>
            <option value="UserName">User Name</option>
            <option value="Score">Score</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Showing {attempts.length} of {pagination.totalCount} attempts
          {filters.skill && ` for ${filters.skill}`}
          {filters.isGraded !== undefined && (filters.isGraded ? ' (graded)' : ' (pending)')}
        </p>

        {isLoading && <Loading size="sm" />}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Attempts Table */}
      <div className="bg-white rounded-lg shadow">
        <AttemptTable
          attempts={attempts}
          onViewDetails={handleViewDetails}
          onGrade={handleGrade}
        />
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.pageNumber}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          totalCount={pagination.totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </main>
  );
});

AttemptsListPage.displayName = 'AttemptsListPage';

export default AttemptsListPage;
