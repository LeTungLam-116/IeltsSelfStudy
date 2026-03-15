import React, { memo, Suspense } from 'react';
import { Card } from '../ui';

const LazyLineChart = React.lazy(() => import('./charts/LineChart'));
const LazyAreaChart = React.lazy(() => import('./charts/AreaChart'));
const LazyBarChart = React.lazy(() => import('./charts/BarChart'));

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface OverviewChartsProps {
  userGrowthData?: ChartDataPoint[];
  revenueData?: ChartDataPoint[];
  averageScores?: Record<string, number>;
  isLoading?: boolean;
}

const OverviewCharts = memo(function OverviewCharts({
  userGrowthData,
  revenueData,
  averageScores,
  isLoading = false
}: OverviewChartsProps) {
  const scoreData = React.useMemo(() =>
    Object.entries(averageScores || {}).map(([name, value]) => ({ name, value })),
    [averageScores]
  );

  if (isLoading) {
    return (
      <section aria-labelledby="charts-loading" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <h2 id="charts-loading" className="sr-only">Đang tải biểu đồ</h2>
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section aria-labelledby="charts-heading" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <h2 id="charts-heading" className="sr-only">Biểu đồ hiệu suất</h2>

      {/* User Growth Chart */}
      <Card className="p-6" role="region" aria-labelledby="user-growth-chart-heading">
        <h3 id="user-growth-chart-heading" className="text-lg font-semibold text-gray-900 mb-4">
          Xu hướng người dùng
        </h3>
        <p className="text-sm text-gray-600 mb-4" id="user-growth-description">
          Số lượng đăng ký mới hàng ngày trong 30 ngày qua
        </p>
        <Suspense fallback={
          <div className="h-64 flex items-center justify-center" aria-live="polite">
            <div className="animate-pulse text-gray-400">Đang tải biểu đồ tăng trưởng...</div>
          </div>
        }>
          <LazyLineChart
            data={userGrowthData || []}
            dataKey="value"
            xAxisKey="date"
            color="#3B82F6"
            height={256}
            ariaLabel="Biểu đồ xu hướng người dùng hiển thị số lượng người dùng theo thời gian"
            ariaDescribedBy="user-growth-description"
          />
        </Suspense>
      </Card>

      {/* Revenue Chart */}
      <Card className="p-6" role="region" aria-labelledby="revenue-chart-heading">
        <h3 id="revenue-chart-heading" className="text-lg font-semibold text-gray-900 mb-4">
          Xu hướng doanh thu
        </h3>
        <p className="text-sm text-gray-600 mb-4" id="revenue-description">
          Doanh thu hàng ngày trong 30 ngày qua (VND)
        </p>
        <Suspense fallback={
          <div className="h-64 flex items-center justify-center" aria-live="polite">
            <div className="animate-pulse text-gray-400">Đang tải biểu đồ doanh thu...</div>
          </div>
        }>
          <LazyAreaChart
            data={revenueData || []}
            dataKey="value"
            xAxisKey="date"
            color="#10B981"
            height={256}
            ariaLabel="Biểu đồ xu hướng doanh thu hiển thị doanh thu theo thời gian"
            ariaDescribedBy="revenue-description"
          />
        </Suspense>
      </Card>


      {/* Average Scores Chart */}
      <div className="col-span-1 lg:col-span-2">
        <Card className="p-6" role="region" aria-labelledby="score-chart-heading">
          <h3 id="score-chart-heading" className="text-lg font-semibold text-gray-900 mb-4">
            Điểm trung bình theo kỹ năng
          </h3>
          <p className="text-sm text-gray-600 mb-4" id="score-description">
            Điểm số trung bình của học viên trên từng kỹ năng (Reading, Listening, Writing, Speaking)
          </p>
          <Suspense fallback={
            <div className="h-64 flex items-center justify-center" aria-live="polite">
              <div className="animate-pulse text-gray-400">Đang tải biểu đồ điểm số...</div>
            </div>
          }>
            <LazyBarChart
              data={scoreData}
              dataKey="value"
              xAxisKey="name"
              color="#8B5CF6"
              height={300}
              ariaLabel="Biểu đồ điểm trung bình theo kỹ năng"
              ariaDescribedBy="score-description"
            />
          </Suspense>
        </Card>
      </div>
    </section >
  );
});

OverviewCharts.displayName = 'OverviewCharts';

export default OverviewCharts;
