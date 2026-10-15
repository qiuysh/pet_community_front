import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AdminSidebar } from './adminSidebar';
import { AdminHeader } from './adminHeader';
import { useLayoutStore } from '../../stores/layoutStore';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { sidebarCollapsed, setSidebarCollapsed } = useLayoutStore();
  const location = useLocation();
  const mobileOpen = !sidebarCollapsed;

  // 移动端切换路由后自动收起抽屉，避免继续遮挡
  useEffect(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) return;
    setSidebarCollapsed(true);
  }, [location.pathname, setSidebarCollapsed]);

  return (
    <div className="min-h-screen bg-cream lg:flex">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-secondary focus:text-white focus:rounded-sm"
      >
        跳到主要内容
      </a>

      {/* 移动端遮罩：仅小屏展开时出现 */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-brown/40 lg:hidden"
          aria-label="关闭导航菜单"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <AdminSidebar />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main id="admin-main" className="flex-1">
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
