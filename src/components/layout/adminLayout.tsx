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
    <div className="flex h-dvh max-h-dvh overflow-hidden bg-cream">
      <a
        href="#admin-main"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:px-4 focus-visible:py-2 focus-visible:bg-secondary focus-visible:text-white focus-visible:rounded-sm"
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

      {/* 顶栏固定；仅 main 区域纵向滚动 */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main id="admin-main" className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
