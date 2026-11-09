import { Link, useLocation } from 'react-router-dom';
import { Calendar, Home, PawPrint, Plus, Search, User } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';

interface TabItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navIconProps = {
  size: ICON_SIZE.nav,
  strokeWidth: iconStroke(ICON_SIZE.nav),
  'aria-hidden': true as const,
};

const tabs: TabItem[] = [
  { path: '/', label: '首页', icon: <Home {...navIconProps} /> },
  { path: '/discover', label: '发现', icon: <Search {...navIconProps} /> },
  { path: '/activities', label: '活动', icon: <Calendar {...navIconProps} /> },
  { path: '/adopts', label: '领养', icon: <PawPrint {...navIconProps} /> },
  { path: '/profile', label: '我的', icon: <User {...navIconProps} /> },
];

/** 发布/编辑/草稿页已有底部操作栏，隐藏发帖 FAB 以免遮挡「存草稿」「草稿箱」 */
function isPostComposerPath(pathname: string): boolean {
  if (pathname === '/posts/create' || pathname.startsWith('/posts/drafts')) {
    return true;
  }
  // /posts/:id/edit
  return /^\/posts\/[^/]+\/edit$/.test(pathname);
}

export function UserTabBar() {
  const location = useLocation();
  const { isLoggedIn, user } = useUserStore();
  const showCreateFab = isLoggedIn && !isPostComposerPath(location.pathname);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/posts';
    }
    if (path === '/profile') {
      return (
        location.pathname === '/profile' ||
        (user != null && location.pathname === `/profile/${user.id}`) ||
        location.pathname.startsWith('/settings') ||
        location.pathname.startsWith('/points') ||
        location.pathname.startsWith('/notification-settings') ||
        location.pathname.startsWith('/my-reports')
      );
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className={['user-tab-bar', showCreateFab ? 'user-tab-bar--with-fab' : ''].filter(Boolean).join(' ')}
      aria-label="底部主导航"
    >
      <div className="tab-bar-items">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`tab-item ${active ? 'active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </Link>
          );
        })}
      </div>
      {showCreateFab && (
        <Link to="/posts/create" className="create-post-fab" aria-label="发布动态">
          <span className="create-post-icon">
            <Plus {...navIconProps} />
          </span>
          <span className="fab-label">发帖</span>
        </Link>
      )}
    </nav>
  );
}
