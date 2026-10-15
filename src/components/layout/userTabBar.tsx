import { Link, useLocation } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore';

interface TabItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const DiscoverIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const ActivityIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
  </svg>
);

const AdoptIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M4.5 12.5c0-3.5 2.5-6 5.5-6s5.5 2.5 5.5 6c0 4-2 7-5.5 7s-5.5-3-5.5-7z" />
    <path d="M14.5 12.5c0-3.5 2.5-6 5.5-6s5.5 2.5 5.5 6c0 4-2 7-5.5 7s-5.5-3-5.5-7z" />
    <circle cx="8" cy="11" r="1" fill="currentColor" />
    <circle cx="18" cy="11" r="1" fill="currentColor" />
  </svg>
);

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CreatePostIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const tabs: TabItem[] = [
  { path: '/', label: '首页', icon: <HomeIcon /> },
  { path: '/discover', label: '发现', icon: <DiscoverIcon /> },
  { path: '/activities', label: '活动', icon: <ActivityIcon /> },
  { path: '/adopts', label: '领养', icon: <AdoptIcon /> },
  { path: '/profile', label: '我的', icon: <UserIcon /> },
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
        location.pathname.startsWith('/notification-settings')
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
            <CreatePostIcon />
          </span>
          <span className="fab-label">发帖</span>
        </Link>
      )}
    </nav>
  );
}
