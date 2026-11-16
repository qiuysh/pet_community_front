import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requireLogin?: boolean;
}

export function ProtectedRoute({ children, requireLogin = true }: ProtectedRouteProps) {
  const authStatus = useUserStore((s) => s.authStatus);
  const location = useLocation();

  if (!requireLogin) {
    return <>{children}</>;
  }

  if (authStatus === 'anonymous') {
    return (
      <Navigate
        to="/login"
        state={{ from: `${location.pathname}${location.search}` }}
        replace
      />
    );
  }

  // bootstrapping：有 token、资料未就绪，避免主人视角 / 等级门禁误判
  if (authStatus === 'bootstrapping') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-stone-500" role="status">
        加载中…
      </div>
    );
  }

  return <>{children}</>;
}
