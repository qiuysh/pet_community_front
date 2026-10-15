import { useAdminStore } from '../../stores/adminStore';
import { useLayoutStore } from '../../stores/layoutStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui';

export function AdminHeader() {
  const { admin, logout } = useAdminStore();
  const { sidebarCollapsed, toggleSidebar } = useLayoutStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-white px-4 shadow-card sm:px-6">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={toggleSidebar}
        className="min-w-0 p-2 flex-shrink-0 lg:hidden hover:bg-soft"
        aria-label={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
        aria-expanded={!sidebarCollapsed}
      >
        {sidebarCollapsed ? (
          <svg className="h-6 w-6 text-brown-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        ) : (
          <svg className="h-6 w-6 text-brown-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </Button>

      <div className="ml-auto flex items-center space-x-4">
        <div className="flex items-center space-x-3" aria-label={`当前管理员：${admin?.username ?? '管理员'}`}>
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm bg-secondary-soft"
            aria-hidden="true"
          >
            <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-brown">{admin?.username || '管理员'}</p>
            <p className="text-xs text-brown-muted">超级管理员</p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="min-w-0 p-2 flex-shrink-0 text-brown-muted hover:bg-secondary-soft hover:text-secondary"
          aria-label="退出登录"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </Button>
      </div>
    </header>
  );
}
