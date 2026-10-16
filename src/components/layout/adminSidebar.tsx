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

interface MenuGroup {
  key: string;
  label: string;
  items: MenuItem[];
}

/** 侧栏分组与文案对齐规格 Ad0–Ad8，按运营工作流排序 */
const menuGroups: MenuGroup[] = [
  {
    key: 'overview',
    label: '概览',
    items: [
      {
        key: 'dashboard',
        label: '运营驾驶舱',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
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
    ],
  },
  {
    key: 'ops',
    label: '内容运营',
    items: [
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
        label: '举报处理',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
        ),
        path: '/admin/reports',
      },
      {
        key: 'activities',
        label: '活动运营',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
        path: '/admin/activities',
      },
      {
        key: 'ads',
        label: '广告投放',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        ),
        path: '/admin/ads',
      },
      {
        key: 'notifications',
        label: '通知公告',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        ),
        path: '/admin/notifications',
      },
    ],
  },
  {
    key: 'users',
    label: '用户',
    items: [
      {
        key: 'front-users',
        label: '社区用户',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        path: '/admin/front-users',
      },
      {
        key: 'users',
        label: '后台账号',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
        path: '/admin/users',
      },
    ],
  },
  {
    key: 'system',
    label: '系统',
    items: [
      {
        key: 'settings',
        label: '站点配置',
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
        label: '敏感词库',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ),
        path: '/admin/sensitive-words',
      },
      {
        key: 'logs',
        label: '日志审计',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        path: '/admin/logs',
      },
    ],
  },
];

export function AdminSidebar() {
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useLayoutStore();
  const location = useLocation();
  const admin = useAdminStore((s) => s.admin);
  const token = useAdminStore((s) => s.token);
  const adminRole = admin?.role || readRoleFromAdminToken(token);

  const visibleGroups = useMemo(
    () =>
      menuGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => canAccessAdminMenu(adminRole, item.key)),
        }))
        .filter((group) => group.items.length > 0),
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
        'admin-sidebar z-50 flex shrink-0 flex-col border-r border-border-light text-brown',
        'transition-[width,transform] duration-300 ease-out',
        // 移动端：抽屉覆盖；桌面：文档流内占满壳层高度，不随主区滚动
        'fixed inset-y-0 left-0 h-dvh w-60',
        'lg:static lg:h-full lg:translate-x-0',
        sidebarCollapsed ? 'lg:w-16' : 'lg:w-60',
        sidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0',
      ].join(' ')}
    >
      <div className="admin-sidebar__header flex h-16 items-center px-4">
        {!sidebarCollapsed ? (
          <Link
            to="/admin/dashboard"
            className="flex min-w-0 items-center gap-3 text-brown hover:text-brown"
            aria-label="运营驾驶舱首页"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-white shadow-card" aria-hidden="true">
              <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="min-w-0 leading-tight">
              <span className="block truncate text-base font-semibold tracking-tight text-brown">宠物社区</span>
              <span className="block text-[11px] font-medium text-brown-muted">运营管理台</span>
            </div>
          </Link>
        ) : (
          <Link
            to="/admin/dashboard"
            className="mx-auto flex h-8 w-8 items-center justify-center rounded-sm bg-white text-secondary shadow-card hover:text-secondary"
            aria-label="运营驾驶舱首页"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </Link>
        )}
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain py-3" aria-label="管理菜单">
        <div className="space-y-4 px-2">
          {visibleGroups.map((group) => (
            <div key={group.key} className="admin-sidebar__group">
              {!sidebarCollapsed && (
                <p className="admin-sidebar__group-label mb-1 px-3 text-[11px] font-medium tracking-wide text-brown-muted">
                  {group.label}
                </p>
              )}
              {sidebarCollapsed && (
                <div className="mx-auto mb-1 hidden h-px w-6 bg-border-light lg:block" aria-hidden="true" />
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <li key={item.key}>
                      <Link
                        to={item.path}
                        className={[
                          'admin-sidebar__link relative flex w-full items-center rounded-sm px-3 py-2 text-sm font-medium transition-colors',
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
            </div>
          ))}
        </div>
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
