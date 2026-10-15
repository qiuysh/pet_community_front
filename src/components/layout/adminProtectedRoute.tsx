import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

/** 后台路由守卫：未登录跳转 /admin/login */
export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const token = useAdminStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
