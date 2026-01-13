import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

// Map route paths to page titles
const getPageTitle = (pathname: string): string => {
  const titleMap: Record<string, string> = {
    '/admin/dashboard': 'Dashboard',

    // Content Management
    '/admin/content': 'Content Manager',
    '/admin/courses': 'Courses Management',
    '/admin/exercises': 'Exercises Management',
    '/admin/exercises/writing': 'Writing Exercises',
    '/admin/exercises/speaking': 'Speaking Exercises',
    '/admin/exercises/listening': 'Listening Exercises',
    '/admin/exercises/reading': 'Reading Exercises',

    // Users Management
    '/admin/users': 'Users Management',

    // Reports & Analytics
    '/admin/reports/attempts-by-exercise': 'Attempts by Exercise',
    '/admin/reports/attempts-by-user': 'Attempts by User',

    // System Settings
    '/admin/settings': 'System Settings',
  };

  // Handle dynamic routes like /admin/exercises/writing/123
  const exerciseDetailMatch = pathname.match(/^\/admin\/exercises\/(writing|speaking|listening|reading)\/\d+$/);
  if (exerciseDetailMatch) {
    const skill = exerciseDetailMatch[1];
    return `${skill.charAt(0).toUpperCase() + skill.slice(1)} Exercise Details`;
  }

  return titleMap[pathname] || 'Admin Panel';
};

export default function AdminLayout() {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64">
        <AdminSidebar />
      </div>

      {/* Main Content Area - Offset by sidebar width */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Fixed Header */}
        <div className="fixed top-0 right-0 left-64 z-40 bg-white border-b border-gray-200 shadow-sm">
          <AdminHeader title={pageTitle} />
        </div>

        {/* Scrollable Page Content */}
        <main className="flex-1 mt-16 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
