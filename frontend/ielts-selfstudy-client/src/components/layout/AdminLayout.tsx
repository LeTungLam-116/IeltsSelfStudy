import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

interface BreadcrumbItem {
  name: string;
  path?: string;
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: '📊',
      description: 'Overview & Statistics'
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: '👥',
      description: 'User Management'
    },
    {
      name: 'Courses',
      path: '/admin/courses',
      icon: '📚',
      description: 'Course Management'
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      icon: '📈',
      description: 'Analytics & Reports'
    },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    // Auto-generate breadcrumbs based on current path
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const crumbs: BreadcrumbItem[] = [{ name: 'Admin', path: '/admin/dashboard' }];

    if (pathSegments.length > 2) {
      const currentSection = navigationItems.find(item =>
        item.path === `/${pathSegments[0]}/${pathSegments[1]}`
      );
      if (currentSection) {
        crumbs.push({ name: currentSection.name });
      }
    }

    return crumbs;
  };

  const currentBreadcrumbs = generateBreadcrumbs();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b bg-blue-600 text-white">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold">⚙️ IELTS Admin</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-blue-700"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActivePath(item.path)
                    ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500 group-hover:text-blue-500">
                    {item.description}
                  </div>
                </div>
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                👤
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user?.fullName}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {user?.role}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <span className="sr-only">Open sidebar</span>
              ☰
            </button>

            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm">
              {currentBreadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                  {crumb.path ? (
                    <Link
                      to={crumb.path}
                      className="text-gray-600 hover:text-blue-600 font-medium"
                    >
                      {crumb.name}
                    </Link>
                  ) : (
                    <span className="text-gray-900 font-medium">{crumb.name}</span>
                  )}
                </div>
              ))}
            </nav>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <span>🕒</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
