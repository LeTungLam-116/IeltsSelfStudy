import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { type ReactNode } from 'react';

interface RequireAdminProps {
  children: ReactNode;
}

export default function RequireAdmin({ children }: RequireAdminProps) {
  const { isAuthenticated, user } = useAuthStore();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but not admin, redirect to unauthorized
  if (user?.role !== 'Admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // If admin, render the protected content
  return <>{children}</>;
}
