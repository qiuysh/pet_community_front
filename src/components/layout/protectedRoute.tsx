import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requireLogin?: boolean;
}

export function ProtectedRoute({ children, requireLogin = true }: ProtectedRouteProps) {
  const { isLoggedIn, token } = useUserStore();
  const location = useLocation();

  if (requireLogin && !isLoggedIn && !token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}