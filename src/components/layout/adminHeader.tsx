import { LogOut, Menu, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import { useLayoutStore } from '../../stores/layoutStore';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { Button } from '../ui';

const headerIconProps = {
  size: ICON_SIZE.nav,
  strokeWidth: iconStroke(ICON_SIZE.nav),
  'aria-hidden': true as const,
};

const metaIconProps = {
  size: ICON_SIZE.action,
  strokeWidth: iconStroke(ICON_SIZE.action),
  'aria-hidden': true as const,
};

export function AdminHeader() {
  const { admin, logout } = useAdminStore();
  const { sidebarCollapsed, toggleSidebar } = useLayoutStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="z-30 flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-white px-4 shadow-card sm:px-6">
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
          <Menu {...headerIconProps} className="text-brown-secondary" />
        ) : (
          <X {...headerIconProps} className="text-brown-secondary" />
        )}
      </Button>

      <div className="ml-auto flex items-center space-x-4">
        <div className="flex items-center space-x-3" aria-label={`当前管理员：${admin?.username ?? '管理员'}`}>
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm bg-secondary-soft"
            aria-hidden="true"
          >
            <User {...metaIconProps} className="text-secondary" />
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
          <LogOut {...metaIconProps} />
        </Button>
      </div>
    </header>
  );
}
