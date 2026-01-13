import { Navigate } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  adminOnly?: boolean;
  userOnly?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  allowedRoles,
  adminOnly = false,
  userOnly = false
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated but trying to access auth pages
  if (!requireAuth && isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    const dashboardPath = user?.role === 'Admin' ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  // Check role permissions
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Admin-only route restrictions
  if (adminOnly && user?.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // User-only route restrictions
  if (userOnly && user?.role === 'Admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}