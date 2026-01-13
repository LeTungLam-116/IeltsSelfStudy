import { useAuthStore } from '../../stores/authStore';

interface AdminHeaderProps {
  title: string;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout on client side
      window.location.href = '/login';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title & Breadcrumb */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="font-medium">Admin</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">{title}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>

        {/* Admin Info & Actions */}
        <div className="flex items-center space-x-4">
          {/* Current Date/Time */}
          <div className="text-sm text-gray-500 hidden md:block">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>

          {/* Admin Info */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.fullName || 'Administrator'}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
