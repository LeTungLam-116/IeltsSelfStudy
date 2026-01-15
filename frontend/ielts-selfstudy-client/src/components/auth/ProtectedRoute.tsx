import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  allowedRoles
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading, isInitialized } = useAuthStore();

  // Show loading while auth state is being initialized
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated but trying to access auth pages
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check role permissions - only if allowedRoles is specified and user exists
  if (allowedRoles && user) {
    // Case insensitive role check
    const roleMatch = allowedRoles.some(role => role.toLowerCase() === user.role.toLowerCase());

    if (!roleMatch) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}