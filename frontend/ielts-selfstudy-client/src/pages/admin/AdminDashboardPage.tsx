import { useState, useEffect, memo, useCallback } from 'react';
import { getOverviewReport, getReportTrends, type TrendDataPoint } from '../../api/reportsApi';
import type { OverviewReportDto } from '../../types/report';
import { KPIGrid, OverviewCharts, RecentTransactionsTable, DateRangePicker } from '../../components/admin';
import { IconRefresh } from '../../components/icons';

const AdminDashboardPage = memo(function AdminDashboardPage() {
  const [overviewData, setOverviewData] = useState<OverviewReportDto | null>(null);
  const [userGrowthData, setUserGrowthData] = useState<TrendDataPoint[]>([]);
  const [revenueData, setRevenueData] = useState<TrendDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Fetch dashboard data from API
  const fetchDashboardData = useCallback(async (start?: string, end?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const [overview, userTrends, revenueTrends] = await Promise.all([
        getOverviewReport(start, end),
        getReportTrends('users', '30d', start, end),
        getReportTrends('revenue', '30d', start, end),
      ]);

      setOverviewData(overview);
      setUserGrowthData(userTrends.data);
      setRevenueData(revenueTrends.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(dateRange.start, dateRange.end);
  }, [dateRange, fetchDashboardData]);

  const handleRangeChange = (start: string, end: string) => {
    setDateRange({ start, end });
  };

  if (isLoading && !overviewData) {
    return (
      <main className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Tổng quan hệ thống</h1>
          <p className="text-gray-600 mt-2">Đang tải dữ liệu tổng quan...</p>
        </header>
        <KPIGrid data={null} isLoading={true} />
      </main>
    );
  }

  if (error && !overviewData) {
    return (
      <main className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Tổng quan hệ thống</h1>
          <DateRangePicker
            startDate={dateRange.start}
            endDate={dateRange.end}
            onRangeChange={handleRangeChange}
            className="mt-4"
          />
        </header>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchDashboardData(dateRange.start, dateRange.end)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tổng quan hệ thống</h1>
          <p className="text-gray-600 mt-2">Chào mừng trở lại! Dưới đây là tình hình hoạt động của nền tảng IELTS.</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker
            startDate={dateRange.start}
            endDate={dateRange.end}
            onRangeChange={handleRangeChange}
          />
          {/* Nút Refresh: cập nhật data mà không cần đổi date range */}
          <button
            onClick={() => fetchDashboardData(dateRange.start, dateRange.end)}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Làm mới dữ liệu"
          >
            <IconRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </header>

      {/* Key Performance Indicators */}
      <KPIGrid data={overviewData} isLoading={isLoading} />

      {/* Charts Section */}
      <OverviewCharts
        userGrowthData={userGrowthData}
        revenueData={revenueData}
        averageScores={overviewData?.averageScoresBySkill}
        isLoading={isLoading}
      />

      {/* Recent Transactions */}
      <RecentTransactionsTable
        transactions={overviewData?.recentTransactions}
        isLoading={isLoading}
      />
    </main>
  );
});

AdminDashboardPage.displayName = 'AdminDashboardPage';

export default AdminDashboardPage;
