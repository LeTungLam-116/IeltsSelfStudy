import { useState, useEffect } from 'react';

interface ReportData {
  date: string;
  users: number;
  courses: number;
  attempts: number;
  revenue: number;
}

interface TopCourse {
  id: number;
  title: string;
  category: string;
  enrollments: number;
  completionRate: number;
}

export default function AdminReportsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [userGrowth, setUserGrowth] = useState({
    total: 1247,
    growth: 12.5,
    newThisMonth: 89
  });
  const [engagement, setEngagement] = useState({
    activeUsers: 892,
    avgSessionTime: 45,
    courseCompletionRate: 68.5
  });

  // Mock data - in real app, fetch from API based on timeRange
  useEffect(() => {
    const mockReportData: ReportData[] = [
      { date: '2024-01-01', users: 1200, courses: 42, attempts: 5200, revenue: 12500 },
      { date: '2024-01-02', users: 1215, courses: 42, attempts: 5350, revenue: 12800 },
      { date: '2024-01-03', users: 1230, courses: 43, attempts: 5480, revenue: 13100 },
      { date: '2024-01-04', users: 1247, courses: 45, attempts: 5832, revenue: 13500 },
    ];
    setReportData(mockReportData);

    const mockTopCourses: TopCourse[] = [
      { id: 1, title: 'IELTS Writing Task 1: Academic', category: 'Writing', enrollments: 245, completionRate: 72.3 },
      { id: 2, title: 'IELTS Speaking Part 1: Personal Topics', category: 'Speaking', enrollments: 189, completionRate: 68.9 },
      { id: 3, title: 'IELTS Listening: Section 3 & 4 Mastery', category: 'Listening', enrollments: 156, completionRate: 75.1 },
      { id: 4, title: 'IELTS Reading: Time Management', category: 'Reading', enrollments: 134, completionRate: 65.4 },
      { id: 5, title: 'IELTS Writing Task 2: Opinion Essays', category: 'Writing', enrollments: 128, completionRate: 71.8 },
    ];
    setTopCourses(mockTopCourses);
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Track platform performance and user engagement</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
            <span className="mr-2">📊</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(userGrowth.total)}</p>
              <p className="text-sm text-green-600 mt-1">
                +{userGrowth.growth}% from last month
              </p>
            </div>
            <div className="text-4xl text-blue-500">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(engagement.activeUsers)}</p>
              <p className="text-sm text-gray-600 mt-1">
                {Math.round((engagement.activeUsers / userGrowth.total) * 100)}% of total users
              </p>
            </div>
            <div className="text-4xl text-green-500">🎯</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Session Time</p>
              <p className="text-3xl font-bold text-gray-900">{engagement.avgSessionTime}m</p>
              <p className="text-sm text-blue-600 mt-1">
                +5% from last month
              </p>
            </div>
            <div className="text-4xl text-purple-500">⏱️</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-3xl font-bold text-gray-900">{engagement.courseCompletionRate}%</p>
              <p className="text-sm text-green-600 mt-1">
                +2.3% from last month
              </p>
            </div>
            <div className="text-4xl text-orange-500">✅</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">User Growth Trend</h3>
          </div>
          <div className="p-6">
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-6xl mb-4">📈</div>
                <p className="text-gray-600">Chart visualization would be implemented here</p>
                <p className="text-sm text-gray-500 mt-2">Using libraries like Chart.js or Recharts</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{userGrowth.newThisMonth}</p>
                <p className="text-sm text-gray-600">New users this month</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{userGrowth.growth}%</p>
                <p className="text-sm text-gray-600">Monthly growth rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Performance Chart */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Course Performance</h3>
          </div>
          <div className="p-6">
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-600">Performance metrics visualization</p>
                <p className="text-sm text-gray-500 mt-2">Enrollment vs Completion rates</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-purple-600">{reportData.length > 0 ? reportData[reportData.length - 1].courses : 0}</p>
                <p className="text-sm text-gray-600">Total courses</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{formatNumber(reportData.reduce((sum, day) => sum + day.attempts, 0) / reportData.length)}</p>
                <p className="text-sm text-gray-600">Avg daily attempts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{engagement.courseCompletionRate}%</p>
                <p className="text-sm text-gray-600">Avg completion</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Courses */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Performing Courses</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topCourses.map((course, index) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                          {index + 1}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {course.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(course.enrollments)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900 mr-2">{course.completionRate}%</div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${course.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      course.completionRate >= 70 ? 'bg-green-100 text-green-800' :
                      course.completionRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {course.completionRate >= 70 ? 'Excellent' :
                       course.completionRate >= 60 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Overview */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Revenue Overview</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(reportData.reduce((sum, day) => sum + day.revenue, 0) / reportData.length * 30)}
                </p>
                <p className="text-sm text-gray-600">Monthly recurring revenue</p>
              </div>
              <div className="text-4xl text-green-500">💰</div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Premium subscriptions</span>
                <span className="font-medium">68%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">One-time purchases</span>
                <span className="font-medium">32%</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Health</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">API Response Time</span>
                </div>
                <span className="text-sm text-gray-600">245ms</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Database Performance</span>
                </div>
                <span className="text-sm text-gray-600">98.5% uptime</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Storage Usage</span>
                </div>
                <span className="text-sm text-gray-600">85% capacity</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Error Rate</span>
                </div>
                <span className="text-sm text-gray-600">0.02%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
