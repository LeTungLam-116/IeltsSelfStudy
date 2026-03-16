import { useState, useEffect } from 'react';
import { Card } from '../../components/ui';
import { getOverviewReport, downloadRevenueReportCsv } from '../../api/reportsApi';
import type { OverviewReportDto } from '../../types/report';
import { DateRangePicker } from '../../components/admin';

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<OverviewReportDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const fetchReport = async (start: string, end: string) => {
    try {
      setIsLoading(true);
      const data = await getOverviewReport(start, end);
      setReportData(data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(dateRange.start, dateRange.end);
  }, [dateRange]);

  const handleExport = async () => {
    await downloadRevenueReportCsv(dateRange.start, dateRange.end);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo & Phân tích</h1>
          <p className="text-gray-600 mt-2">Phân tích chuyên sâu về hiệu suất hệ thống và học viên.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <DateRangePicker 
            startDate={dateRange.start} 
            endDate={dateRange.end} 
            onRangeChange={(s, e) => setDateRange({ start: s, end: e })} 
          />
          <button
            onClick={handleExport}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Xuất Excel (CSV)
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Students Table */}
        <Card className="overflow-hidden border-none shadow-sm">
          <div className="p-6 bg-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Top Học viên xuất sắc</h2>
            <p className="text-sm text-gray-500 mt-1">Dựa trên điểm số trung bình và số lượng bài tập hoàn thành.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Học viên</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Số bài tập</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Điểm trung bình</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-2/3"></div></td>
                      <td className="px-6 py-4 text-center"><div className="h-4 bg-gray-100 rounded w-1/2 mx-auto"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-100 rounded w-1/3 ml-auto"></div></td>
                    </tr>
                  ))
                ) : reportData?.topStudents.length ? (
                  reportData.topStudents.map((s) => (
                    <tr key={s.userId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{s.fullName}</td>
                      <td className="px-6 py-4 text-center text-gray-600">{s.completedAttempts}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold bg-blue-50 text-blue-700">
                          {s.averageScore.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400">Không có dữ liệu trong khoảng thời gian này.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Difficult Exercises Table */}
        <Card className="overflow-hidden border-none shadow-sm">
          <div className="p-6 bg-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Các Bài tập độ khó cao</h2>
            <p className="text-sm text-gray-500 mt-1">Các bài tập có điểm số trung bình thấp nhất, cần được lưu ý.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tên bài tập</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kỹ năng</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Điểm TB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-2/3"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-1/2"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-100 rounded w-1/2 ml-auto"></div></td>
                    </tr>
                  ))
                ) : reportData?.difficultExercises.length ? (
                  reportData.difficultExercises.map((e) => (
                    <tr key={e.exerciseId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-[200px]">{e.title}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-600">
                          {e.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-red-600">
                        {e.averageScore.toFixed(1)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400">Không có dữ liệu trong khoảng thời gian này.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Summary insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-6 bg-blue-600 text-white">
          <h3 className="text-blue-100 text-sm font-medium uppercase tracking-wider">Tỉ lệ hoàn thành</h3>
          <p className="text-3xl font-bold mt-2">{reportData?.courseCompletionRatePercentage.toFixed(1)}%</p>
          <div className="w-full bg-blue-400/30 h-2 rounded-full mt-4">
            <div
              className="bg-white h-full rounded-full transition-all duration-1000"
              style={{ width: `${reportData?.courseCompletionRatePercentage || 0}%` }}
            ></div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-none shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Doanh thu kỳ này</h3>
            <p className="text-3xl font-bold mt-2 text-gray-900">
              {reportData?.monthlyRecurringRevenue.toLocaleString('vi-VN')} <span className="text-lg font-normal">VND</span>
            </p>
          </div>
          <div className={`mt-4 flex items-center gap-1 text-sm font-medium ${reportData && reportData.revenueGrowthPercentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            <span>{reportData && reportData.revenueGrowthPercentage >= 0 ? '↑' : '↓'} {Math.abs(reportData?.revenueGrowthPercentage || 0).toFixed(1)}%</span>
            <span className="text-gray-400 font-normal">so với trước đó</span>
          </div>
        </Card>

        <Card className="p-6 bg-white border-none shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Học sinh mới</h3>
            <p className="text-3xl font-bold mt-2 text-gray-900">{reportData?.newUsersThisMonth}</p>
          </div>
          <div className={`mt-4 flex items-center gap-1 text-sm font-medium ${reportData && reportData.userGrowthPercentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            <span>{reportData && reportData.userGrowthPercentage >= 0 ? '↑' : '↓'} {Math.abs(reportData?.userGrowthPercentage || 0).toFixed(1)}%</span>
            <span className="text-gray-400 font-normal">tăng trưởng</span>
          </div>
        </Card>
      </div>
    </div>
  );
}