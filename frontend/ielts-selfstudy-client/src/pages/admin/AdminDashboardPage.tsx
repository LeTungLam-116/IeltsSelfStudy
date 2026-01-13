import { useAuthStore } from '../../stores/authStore';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();

  const stats = [
    { title: 'Total Users', value: '0', icon: '👥', color: 'bg-blue-500' },
    { title: 'Active Courses', value: '0', icon: '📚', color: 'bg-green-500' },
    { title: 'Exercises', value: '0', icon: '✏️', color: 'bg-purple-500' },
    { title: 'Total Attempts', value: '0', icon: '📊', color: 'bg-orange-500' },
  ];

  const recentActivities = [
    { action: 'New user registered', time: '2 minutes ago', type: 'user' },
    { action: 'Course updated', time: '15 minutes ago', type: 'course' },
    { action: 'New exercise added', time: '1 hour ago', type: 'exercise' },
    { action: 'User completed assessment', time: '2 hours ago', type: 'attempt' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.fullName}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your IELTS Self Study platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <span className="text-white text-xl">{stat.icon}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-900">{activity.action}</span>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group">
            <div className="text-lg font-medium text-gray-900 group-hover:text-blue-600">Add New Course</div>
            <div className="text-sm text-gray-600 mt-1">Create a new course for students</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group">
            <div className="text-lg font-medium text-gray-900 group-hover:text-blue-600">Manage Users</div>
            <div className="text-sm text-gray-600 mt-1">View and manage user accounts</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group">
            <div className="text-lg font-medium text-gray-900 group-hover:text-blue-600">View Reports</div>
            <div className="text-sm text-gray-600 mt-1">Check system analytics and reports</div>
          </button>
        </div>
      </div>

      {/* Sample Content for Scrolling Test */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent System Logs</h2>
          <div className="space-y-3">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">System log entry #{i + 1}</span>
                </div>
                <span className="text-xs text-gray-500">{new Date(Date.now() - i * 60000).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{Math.floor(Math.random() * 100)}</div>
                <div className="text-sm text-gray-600">Metric #{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
