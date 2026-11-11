import { ReactNode, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Flag,
  LayoutDashboard,
  Lock,
  Megaphone,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react';
import { useLayoutStore } from '../../stores/layoutStore';
import { useAdminStore } from '../../stores/adminStore';
import { useSiteConfigStore } from '../../stores/siteConfigStore';
import { DEFAULT_SITE_NAME } from '../../utils/documentTitle';
import { canAccessAdminMenu, readRoleFromAdminToken } from '../../utils/adminRole';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
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

const menuIconProps = {
  size: ICON_SIZE.action,
  strokeWidth: iconStroke(ICON_SIZE.action),
  'aria-hidden': true as const,
  className: 'w-5 h-5',
};

const collapseIconProps = {
  size: ICON_SIZE.inline,
  strokeWidth: iconStroke(ICON_SIZE.inline),
  'aria-hidden': true as const,
};

/** 侧栏分组与文案对齐规格 Ad0–Ad8，按运营工作流排序 */
const menuGroups: MenuGroup[] = [
  {
    key: 'overview',
    label: '概览',
    items: [
      {
        key: 'dashboard',
        label: '运营驾驶舱',
        icon: <LayoutDashboard {...menuIconProps} />,
        path: '/admin/dashboard',
      },
      {
        key: 'analytics',
        label: '分析报表',
        icon: <BarChart3 {...menuIconProps} />,
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
        icon: <ShieldCheck {...menuIconProps} />,
        path: '/admin/reviews',
      },
      {
        key: 'reports',
        label: '举报处理',
        icon: <Flag {...menuIconProps} />,
        path: '/admin/reports',
      },
      {
        key: 'activities',
        label: '活动运营',
        icon: <Calendar {...menuIconProps} />,
        path: '/admin/activities',
      },
      {
        key: 'ads',
        label: '广告投放',
        icon: <Megaphone {...menuIconProps} />,
        path: '/admin/ads',
      },
      {
        key: 'notifications',
        label: '通知公告',
        icon: <Bell {...menuIconProps} />,
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
        icon: <Users {...menuIconProps} />,
        path: '/admin/front-users',
      },
      {
        key: 'users',
        label: '后台账号',
        icon: <UserCog {...menuIconProps} />,
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
        icon: <Settings {...menuIconProps} />,
        path: '/admin/settings',
      },
      {
        key: 'sensitive-words',
        label: '敏感词库',
        icon: <Lock {...menuIconProps} />,
        path: '/admin/sensitive-words',
      },
      {
        key: 'logs',
        label: '日志审计',
        icon: <FileText {...menuIconProps} />,
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
  const siteName = useSiteConfigStore((state) => state.siteName) || DEFAULT_SITE_NAME;

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
              <ShieldCheck {...menuIconProps} className="h-5 w-5 text-secondary" />
            </div>
            <div className="min-w-0 leading-tight">
              <span className="block truncate text-base font-semibold tracking-tight text-brown">{siteName}</span>
              <span className="block text-[11px] font-medium text-brown-muted">运营管理台</span>
            </div>
          </Link>
        ) : (
          <Link
            to="/admin/dashboard"
            className="mx-auto flex h-8 w-8 items-center justify-center rounded-sm bg-white text-secondary shadow-card hover:text-secondary"
            aria-label="运营驾驶舱首页"
          >
            <ShieldCheck {...menuIconProps} className="h-5 w-5" />
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
          <ChevronRight {...collapseIconProps} />
        ) : (
          <ChevronLeft {...collapseIconProps} />
        )}
      </button>
    </aside>
  );
}
