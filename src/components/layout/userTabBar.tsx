import { Link, useLocation } from 'react-router-dom';
import { Compass, HeartHandshake, Home, MessageCircle, Plus, User } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { useNavUnreadCounts } from '../../hooks/useNavUnreadCounts';
import { formatCount } from '../../utils/format';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';

interface TabItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  match?: 'messages';
}

const navIconProps = {
  size: ICON_SIZE.nav,
  strokeWidth: iconStroke(ICON_SIZE.nav),
  'aria-hidden': true as const,
};

const tabs: TabItem[] = [
  { path: '/', label: '首页', icon: <Home {...navIconProps} /> },
  // Compass：发现；避免与顶栏 Search 语义冲突
  { path: '/discover', label: '发现', icon: <Compass {...navIconProps} /> },
  // 消息中枢（私信）；活动仍在顶栏主导航
  { path: '/messages', label: '消息', icon: <MessageCircle {...navIconProps} />, match: 'messages' },
  // HeartHandshake：领养陪伴；与品牌爪印 / 宠物档案区分
  { path: '/adopts', label: '领养', icon: <HeartHandshake {...navIconProps} /> },
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
  const { messageUnread, notificationUnread } = useNavUnreadCounts();
  const showCreateFab = isLoggedIn && !isPostComposerPath(location.pathname);
  const messagesBadge = messageUnread + notificationUnread;

  const isActive = (tab: TabItem) => {
    if (tab.path === '/') {
      return location.pathname === '/' || location.pathname === '/posts';
    }
    if (tab.match === 'messages') {
      return (
        location.pathname.startsWith('/messages') ||
        location.pathname.startsWith('/notifications')
      );
    }
    if (tab.path === '/profile') {
      return (
        location.pathname === '/profile' ||
        (user != null && location.pathname === `/profile/${user.id}`) ||
        location.pathname.startsWith('/settings') ||
        location.pathname.startsWith('/points') ||
        location.pathname.startsWith('/notification-settings') ||
        location.pathname.startsWith('/my-reports')
      );
    }
    return location.pathname.startsWith(tab.path);
  };

  return (
    <nav
      className={['user-tab-bar', showCreateFab ? 'user-tab-bar--with-fab' : ''].filter(Boolean).join(' ')}
      aria-label="底部主导航"
    >
      <div className="tab-bar-items">
        {tabs.map((tab) => {
          const active = isActive(tab);
          const showBadge = tab.match === 'messages' && isLoggedIn && messagesBadge > 0;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`tab-item ${active ? 'active' : ''}`}
              aria-current={active ? 'page' : undefined}
              aria-label={
                showBadge
                  ? `消息，${formatCount(messagesBadge)}条未读`
                  : undefined
              }
            >
              <span className="tab-icon">
                {tab.icon}
                {showBadge && (
                  <span className="tab-unread-badge" aria-hidden="true">
                    {messagesBadge > 99 ? '99+' : formatCount(messagesBadge)}
                  </span>
                )}
              </span>
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
