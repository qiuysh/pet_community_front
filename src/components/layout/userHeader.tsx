import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, MessageCircle, PawPrint, Search } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { useSiteConfigStore } from '../../stores/siteConfigStore';
import { useNavUnreadCounts } from '../../hooks/useNavUnreadCounts';
import { DEFAULT_SITE_NAME } from '../../utils/documentTitle';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { formatCount } from '../../utils/format';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { Avatar } from '../ui/avatar';
import { Button, buttonClass } from '../ui/button';
import { Dropdown } from '../ui/dropdown';
import { USER_HEADER_NAV, USER_MOBILE_MORE_NAV } from './userNav';

const actionIconProps = {
  size: ICON_SIZE.action,
  strokeWidth: iconStroke(ICON_SIZE.action),
  'aria-hidden': true as const,
};

/** 与站点自定义 logo 图同宽，避免切换时顶栏跳动 */
const LOGO_MARK_SIZE = 28;

function UnreadBadge({ count, label }: { count: number; label: string }) {
  if (count <= 0) return null;
  const text = count > 99 ? '99+' : formatCount(count);
  return (
    <span className="nav-unread-badge" aria-label={`${label}${text}`}>
      {text}
    </span>
  );
}

export function UserHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useUserStore();
  const { messageUnread, notificationUnread } = useNavUnreadCounts();
  // 站点名称 / Logo 由后台「站点配置」维护，未配置时用默认站点名 + 内置图标
  const siteName = useSiteConfigStore((state) => state.siteName) || DEFAULT_SITE_NAME;
  const siteLogo = useSiteConfigStore((state) => state.siteLogo);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/posts';
    }
    return location.pathname.startsWith(path);
  };

  const navClass = (path: string) =>
    `nav-item ${isActive(path) ? 'active' : ''}`;

  const mobileMoreItems = [
    ...USER_MOBILE_MORE_NAV.map((item) => ({ key: item.path, label: item.label })),
    ...(isLoggedIn
      ? [
          {
            key: '/notifications',
            label:
              notificationUnread > 0 ? `通知（${formatCount(notificationUnread)}）` : '通知',
          },
          {
            key: '/messages',
            label: messageUnread > 0 ? `私信（${formatCount(messageUnread)}）` : '私信',
          },
        ]
      : []),
  ];

  return (
    <header className="user-header">
      <div className="header-content">
        <Link to="/" className="logo" aria-label={`${siteName}首页`}>
          {siteLogo ? (
            <img
              className="logo-img"
              src={siteLogo}
              alt=""
              width={LOGO_MARK_SIZE}
              height={LOGO_MARK_SIZE}
              decoding="async"
            />
          ) : (
            <PawPrint
              className="logo-icon"
              size={LOGO_MARK_SIZE}
              strokeWidth={iconStroke(LOGO_MARK_SIZE)}
              aria-hidden="true"
            />
          )}
          <span className="logo-text">{siteName}</span>
        </Link>

        <nav className="header-nav" aria-label="主导航">
          {USER_HEADER_NAV.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={navClass(item.path)}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Dropdown
            aria-label="更多导航"
            className="mobile-nav-more"
            trigger={
              <Button type="button" variant="ghost" className="action-link p-0" aria-label="更多导航">
                <Menu {...actionIconProps} />
              </Button>
            }
            items={mobileMoreItems}
            onAction={(key) => navigate(key)}
          />
          {isLoggedIn ? (
            <div className="user-menu">
              <Link to="/search" className="action-link" aria-label="搜索">
                <Search {...actionIconProps} />
              </Link>
              <Link
                to="/notifications"
                className="action-link action-link--secondary"
                aria-label={notificationUnread > 0 ? `通知，${notificationUnread}条未读` : '通知'}
              >
                <Bell {...actionIconProps} />
                <UnreadBadge count={notificationUnread} label="未读通知" />
              </Link>
              <Link
                to="/messages"
                className="action-link action-link--secondary"
                aria-label={messageUnread > 0 ? `私信，${messageUnread}条未读` : '私信'}
              >
                <MessageCircle {...actionIconProps} />
                <UnreadBadge count={messageUnread} label="未读私信" />
              </Link>
              <Dropdown
                aria-label="用户菜单"
                trigger={
                  <Button type="button" variant="ghost" className="user-avatar-btn p-0 min-w-0 h-auto" aria-label="用户菜单">
                    <Avatar
                      src={user?.avatar || getDefaultUserAvatar()}
                      name={user?.nickname}
                      alt={`${user?.nickname ?? '用户'}的头像`}
                      size="md"
                      className="user-avatar"
                    />
                  </Button>
                }
                items={[
                  { key: 'settings', label: '个人设置' },
                  { key: 'points', label: '我的积分' },
                  { key: 'notification-settings', label: '通知设置' },
                  { key: 'my-reports', label: '我的举报' },
                  { key: 'logout', label: '退出登录', danger: true },
                ]}
                onAction={(key) => {
                  if (key === 'logout') {
                    logout();
                    return;
                  }
                  navigate(`/${key}`);
                }}
              />
            </div>
          ) : (
            <div className="auth-buttons flex items-center gap-2">
              <Link to="/login" className={buttonClass({ variant: 'ghost', size: 'sm' })}>
                登录
              </Link>
              <Link to="/register" className={buttonClass({ variant: 'primary', size: 'sm' })}>
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
