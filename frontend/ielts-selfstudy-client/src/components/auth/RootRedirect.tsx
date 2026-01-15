import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function RootRedirect() {
  const { user, isAuthenticated, isInitialized } = useAuthStore();

  // Show loading while auth state is being initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect based on role
  if (isAuthenticated && user) {
    return user.role?.toLowerCase() === 'admin' ? (
      <Navigate to="/admin/dashboard" replace />
    ) : (
      <Navigate to="/dashboard" replace />
    );
  }

  // Default fallback
  return <Navigate to="/dashboard" replace />;
}
