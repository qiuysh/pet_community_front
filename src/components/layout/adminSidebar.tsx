import { ReactNode, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLayoutStore } from '../../stores/layoutStore';
import { useAdminStore } from '../../stores/adminStore';
import { canAccessAdminMenu, readRoleFromAdminToken } from '../../utils/adminRole';
import './adminSidebar.scss';

interface MenuItem {
  key: string;
  label: string;
  icon: ReactNode;
  path: string;
}

const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    label: '仪表盘',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 14a8 8 0 0 1 16 0M12 9v4m0 0l2.5 2.5M12 13L9.5 15.5" />
      </svg>
    ),
    path: '/admin/dashboard',
  },
  {
    key: 'analytics',
    label: '分析报表',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    path: '/admin/analytics',
  },
  {
    key: 'users',
    label: '运营人员管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    path: '/admin/users',
  },
  {
    key: 'front-users',
    label: '用户管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    path: '/admin/front-users',
  },
  {
    key: 'settings',
    label: '系统设置',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    path: '/admin/settings',
  },
  {
    key: 'sensitive-words',
    label: '敏感词管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    path: '/admin/sensitive-words',
  },
  {
    key: 'logs',
    label: '日志管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    path: '/admin/logs',
  },
  {
    key: 'reviews',
    label: '内容审核',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    path: '/admin/reviews',
  },
  {
    key: 'reports',
    label: '举报管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
      </svg>
    ),
    path: '/admin/reports',
  },
  {
    key: 'notifications',
    label: '通知管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    path: '/admin/notifications',
  },
  {
    key: 'ads',
    label: '广告管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    path: '/admin/ads',
  },
];

export function AdminSidebar() {
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useLayoutStore();
  const location = useLocation();
  const admin = useAdminStore((s) => s.admin);
  const token = useAdminStore((s) => s.token);
  const adminRole = admin?.role || readRoleFromAdminToken(token);

  const visibleMenus = useMemo(
    () => menuItems.filter((item) => canAccessAdminMenu(adminRole, item.key)),
    [adminRole],
  );

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // 进入桌面宽度时，保证侧栏参与文档流（不沿用移动端「收起=隐藏」）
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => {
      // 切到桌面时不强制改 collapsed，仅确保布局类正确；切到移动端默认收起抽屉
      if (!mq.matches) {
        setSidebarCollapsed(true);
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [setSidebarCollapsed]);

  const collapseLabel = sidebarCollapsed ? '展开侧边栏' : '收起侧边栏';

  return (
    <aside
      aria-label="管理后台导航"
      className={[
        'admin-sidebar z-50 flex h-screen shrink-0 flex-col border-r border-border-light text-brown',
        'transition-[width,transform] duration-300 ease-out',
        // 桌面：始终在文档流内，收起为图标栏 / 展开为完整宽
        'lg:sticky lg:top-0 lg:translate-x-0',
        sidebarCollapsed ? 'lg:w-16' : 'lg:w-64',
        // 移动端：抽屉，收起滑出屏幕，展开覆盖并配合遮罩
        'fixed inset-y-0 left-0 w-64',
        sidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0',
      ].join(' ')}
    >
      <div className="admin-sidebar__header flex h-16 items-center px-4">
        {!sidebarCollapsed ? (
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 text-brown hover:text-brown"
            aria-label="管理后台首页"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-white shadow-card" aria-hidden="true">
              <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-[24px] font-semibold tracking-tight text-brown">管理后台</span>
          </Link>
        ) : (
          <Link
            to="/admin/dashboard"
            className="mx-auto flex h-8 w-8 items-center justify-center rounded-sm bg-white text-secondary shadow-card hover:text-secondary"
            aria-label="管理后台首页"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </Link>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3" aria-label="管理菜单">
        <ul className="space-y-0.5 px-2">
          {visibleMenus.map((item) => {
            const active = isActive(item.path);
            return (
              <li key={item.key}>
                <Link
                  to={item.path}
                  className={[
                    'admin-sidebar__link relative flex w-full items-center rounded-sm px-3 py-2.5 text-sm font-medium transition-colors',
                    sidebarCollapsed ? 'lg:justify-center lg:px-2' : '',
                  ].join(' ')}
                  aria-current={active ? 'page' : undefined}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  {active && (
                    <span
                      className="absolute bottom-1.5 left-0 top-1.5 w-[3px] rounded-r-full bg-secondary"
                      aria-hidden="true"
                    />
                  )}
                  <span className="flex-shrink-0 text-current">{item.icon}</span>
                  <span className={sidebarCollapsed ? 'ml-3 lg:hidden' : 'ml-3'}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 桌面端收起/展开，贴在侧栏右缘，不遮挡主内容区 */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-border-light bg-white text-brown-secondary shadow-card transition-colors hover:border-secondary hover:text-secondary lg:flex"
        aria-label={collapseLabel}
        aria-expanded={!sidebarCollapsed}
      >
        {sidebarCollapsed ? (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        )}
      </button>
    </aside>
  );
}
