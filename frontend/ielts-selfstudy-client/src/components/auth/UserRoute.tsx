import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { type ReactNode } from 'react';

interface UserRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * UserRoute - Protects routes for regular users (non-admin)
 * Redirects admin users to admin dashboard
 * Usage: <UserRoute><UserLayout /></UserRoute>
 */
export default function UserRoute({
  children,
  redirectTo = '/admin/dashboard'
}: UserRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // If not authenticated, redirect to login with return url
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated admin, redirect to admin dashboard
  if (user?.role === 'Admin') {
    return <Navigate to={redirectTo} replace />;
  }

  // If regular user, render the protected content
  return <>{children}</>;
}
