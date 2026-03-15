import { memo } from 'react';
import { IconUsers, IconChart, IconMoney, IconDocument, IconBook } from '../icons';
import StatCard from './StatCard';
import type { OverviewReportDto } from '../../types/report';

export interface KPIGridProps {
  data: OverviewReportDto | null;
  isLoading?: boolean;
}

const KPIGrid = memo(function KPIGrid({ data, isLoading = false }: KPIGridProps) {
  if (isLoading) {
    return (
      <section aria-labelledby="kpi-loading" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <h2 id="kpi-loading" className="sr-only">Key Performance Indicators Loading</h2>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </section>
    );
  }

  if (!data) {
    return (
      <section aria-labelledby="kpi-error" className="text-center py-12">
        <h2 id="kpi-error" className="sr-only">Lỗi tải chỉ số hệ thống</h2>
        <p className="text-gray-600">Không có dữ liệu chỉ số</p>
      </section>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  return (
    <section aria-labelledby="kpi-heading" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      <h2 id="kpi-heading" className="sr-only">Chỉ số hiệu suất chính</h2>

      <StatCard
        title="Tổng người dùng"
        value={formatNumber(data.totalUsers)}
        icon={<IconUsers />}
        change={`+${data.userGrowthPercentage.toFixed(1)}% so với tháng trước`}
        changeType="positive"
        sparklineData={[1200, 1215, 1230, 1247]} // Mock sparkline data
      />

      <StatCard
        title="Đang hoạt động"
        value={formatNumber(data.activeUsers)}
        icon={<IconChart />}
        change={`${Math.round((data.activeUsers / data.totalUsers) * 100)}% tổng người dùng`}
        changeType="neutral"
        sparklineData={[850, 860, 875, 892]} // Mock sparkline data
      />

      <StatCard
        title="Tổng khóa học"
        value={data.totalCourses}
        icon={<IconBook />}
        change="Xem chi tiết các khóa học"
        changeType="neutral"
        sparklineData={[40, 41, 42, 45]} // Mock sparkline data
      />

      <StatCard
        title="Lượt làm bài"
        value={formatNumber(data.totalAttempts)}
        icon={<IconDocument />}
        change={`Thời gian TB: ${data.averageSessionTimeMinutes} phút`}
        changeType="neutral"
        sparklineData={[5000, 5200, 5400, 5832]} // Mock sparkline data
      />

      <StatCard
        title="Doanh thu"
        value={formatCurrency(data.monthlyRecurringRevenue)}
        icon={<IconMoney />}
        change={`+${data.revenueGrowthPercentage.toFixed(1)}% so với tháng trước`}
        changeType="positive"
        sparklineData={[12000, 12500, 13100, 13500]} // Mock sparkline data
      />
    </section>
  );
});

KPIGrid.displayName = 'KPIGrid';

export default KPIGrid;
