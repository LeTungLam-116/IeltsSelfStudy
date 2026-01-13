import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { type ReactNode } from 'react';

interface AdminRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * AdminRoute - Alternative syntax for protecting admin routes
 * Usage: <AdminRoute><AdminLayout /></AdminRoute>
 */
export default function AdminRoute({
  children,
  redirectTo = '/unauthorized'
}: AdminRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // If not authenticated, redirect to login with return url
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but not admin, redirect to specified page
  if (user?.role !== 'Admin') {
    return <Navigate to={redirectTo} replace />;
  }

  // If admin, render the protected content
  return <>{children}</>;
}
