import { useState, useEffect, memo } from 'react';
import { getOverviewReport, getReportTrends, type TrendDataPoint } from '../../api/reportsApi';
import type { OverviewReportDto } from '../../types/report';
import { KPIGrid, OverviewCharts } from '../../components/admin';

const AdminDashboardPage = memo(function AdminDashboardPage() {
  const [overviewData, setOverviewData] = useState<OverviewReportDto | null>(null);
  const [userGrowthData, setUserGrowthData] = useState<TrendDataPoint[]>([]);
  const [revenueData, setRevenueData] = useState<TrendDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch overview data
        const overview = await getOverviewReport();
        setOverviewData(overview);

        // Fetch trends data in parallel
        const [userTrends, revenueTrends] = await Promise.all([
          getReportTrends('users', '30d'),
          getReportTrends('revenue', '30d')
        ]);

        setUserGrowthData(userTrends.data);
        setRevenueData(revenueTrends.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <main className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Loading dashboard data...</p>
        </header>
        <KPIGrid data={null} isLoading={true} />
      </main>
    );
  }

  if (error) {
    return (
      <main className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your IELTS platform.</p>
        </header>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your IELTS platform.</p>
      </header>

      {/* Key Performance Indicators */}
      <KPIGrid data={overviewData} />

      {/* Charts Section */}
      <OverviewCharts
        userGrowthData={userGrowthData}
        revenueData={revenueData}
        isLoading={isLoading}
      />
    </main>
  );
});

AdminDashboardPage.displayName = 'AdminDashboardPage';

export default AdminDashboardPage;
