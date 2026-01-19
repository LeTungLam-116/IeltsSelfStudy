import React, { memo, Suspense } from 'react';
import { Card } from '../ui';

const LazyLineChart = React.lazy(() => import('./charts/LineChart'));
const LazyAreaChart = React.lazy(() => import('./charts/AreaChart'));

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface OverviewChartsProps {
  userGrowthData?: ChartDataPoint[];
  revenueData?: ChartDataPoint[];
  isLoading?: boolean;
}

const OverviewCharts = memo(function OverviewCharts({
  userGrowthData,
  revenueData,
  isLoading = false
}: OverviewChartsProps) {
  if (isLoading) {
    return (
      <section aria-labelledby="charts-loading" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <h2 id="charts-loading" className="sr-only">Charts Loading</h2>
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
      <h2 id="charts-heading" className="sr-only">Performance Charts</h2>

      {/* User Growth Chart */}
      <Card className="p-6" role="region" aria-labelledby="user-growth-chart-heading">
        <h3 id="user-growth-chart-heading" className="text-lg font-semibold text-gray-900 mb-4">
          User Growth Trend
        </h3>
        <p className="text-sm text-gray-600 mb-4" id="user-growth-description">
          Daily user registration trends over the last 30 days
        </p>
        <Suspense fallback={
          <div className="h-64 flex items-center justify-center" aria-live="polite">
            <div className="animate-pulse text-gray-400">Loading user growth chart...</div>
          </div>
        }>
          <LazyLineChart
            data={userGrowthData || []}
            dataKey="value"
            xAxisKey="date"
            color="#3B82F6"
            height={256}
            ariaLabel="User growth trend chart showing number of users over time"
            ariaDescribedBy="user-growth-description"
          />
        </Suspense>
      </Card>

      {/* Revenue Chart */}
      <Card className="p-6" role="region" aria-labelledby="revenue-chart-heading">
        <h3 id="revenue-chart-heading" className="text-lg font-semibold text-gray-900 mb-4">
          Revenue Trend
        </h3>
        <p className="text-sm text-gray-600 mb-4" id="revenue-description">
          Daily revenue trends over the last 30 days in USD
        </p>
        <Suspense fallback={
          <div className="h-64 flex items-center justify-center" aria-live="polite">
            <div className="animate-pulse text-gray-400">Loading revenue chart...</div>
          </div>
        }>
          <LazyAreaChart
            data={revenueData || []}
            dataKey="value"
            xAxisKey="date"
            color="#10B981"
            height={256}
            ariaLabel="Revenue trend chart showing revenue over time"
            ariaDescribedBy="revenue-description"
          />
        </Suspense>
      </Card>
    </section>
  );
});

OverviewCharts.displayName = 'OverviewCharts';

export default OverviewCharts;
