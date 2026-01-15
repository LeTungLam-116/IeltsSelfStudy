import { useState, useEffect } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

function StatCard({ title, value, icon, change, changeType }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${
              changeType === 'positive' ? 'text-green-600' :
              changeType === 'negative' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className="text-4xl text-gray-400">
          {icon}
        </div>
      </div>
    </div>
  );
}

interface RecentActivity {
  id: number;
  user: string;
  action: string;
  timestamp: string;
  type: 'user' | 'course' | 'attempt';
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalAttempts: 0,
    activeUsers: 0,
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // Mock data - in real app, fetch from API
  useEffect(() => {
    // Simulate API call
    setStats({
      totalUsers: 1247,
      totalCourses: 45,
      totalAttempts: 5832,
      activeUsers: 892,
    });

    setRecentActivities([
      {
        id: 1,
        user: 'John Smith',
        action: 'completed Writing Task 1',
        timestamp: '2 minutes ago',
        type: 'attempt',
      },
      {
        id: 2,
        user: 'Sarah Johnson',
        action: 'enrolled in Advanced Speaking',
        timestamp: '15 minutes ago',
        type: 'course',
      },
      {
        id: 3,
        user: 'Mike Davis',
        action: 'joined the platform',
        timestamp: '1 hour ago',
        type: 'user',
      },
      {
        id: 4,
        user: 'Emma Wilson',
        action: 'completed Listening Section 3',
        timestamp: '2 hours ago',
        type: 'attempt',
      },
    ]);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return '👤';
      case 'course': return '📚';
      case 'attempt': return '✅';
      default: return '📝';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your IELTS platform.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon="👥"
          change="+12% from last month"
          changeType="positive"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          icon="🎯"
          change="+8% from last week"
          changeType="positive"
        />
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon="📚"
          change="+3 new courses"
          changeType="positive"
        />
        <StatCard
          title="Practice Attempts"
          value={stats.totalAttempts.toLocaleString()}
          icon="📝"
          change="+15% from last month"
          changeType="positive"
        />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="text-lg">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activity.action}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {activity.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View all activity →
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-4">
            <button className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              <span className="mr-2">➕</span>
              Add New Course
            </button>
            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <span className="mr-2">👤</span>
              Manage Users
            </button>
            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <span className="mr-2">📊</span>
              View Reports
            </button>
            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <span className="mr-2">⚙️</span>
              System Settings
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Status</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">API Status</p>
                <p className="text-xs text-gray-600">All systems operational</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className="text-xs text-gray-600">Connected and healthy</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Storage</p>
                <p className="text-xs text-gray-600">85% capacity used</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
