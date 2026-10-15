import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Dropdown } from '../ui/dropdown';

export function UserHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useUserStore();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/posts';
    }
    return location.pathname.startsWith(path);
  };

  const navClass = (path: string) =>
    `nav-item ${isActive(path) ? 'active' : ''}`;

  return (
    <header className="user-header">
      <div className="header-content">
        <Link to="/" className="logo" aria-label="宠物社区首页">
          <svg className="logo-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="4" r="2.5" />
            <circle cx="18" cy="8" r="2" />
            <circle cx="4" cy="8" r="2" />
            <circle cx="6" cy="14" r="1.8" />
            <circle cx="16" cy="14" r="1.8" />
            <path d="M11 7c-3 0-5 2-5 5 0 3 2 5 5 5s5-2 5-5-2-5-5-5z" />
          </svg>
          <span className="logo-text">宠物社区</span>
        </Link>

        <nav className="header-nav" aria-label="主导航">
          <Link to="/" className={navClass('/')} aria-current={isActive('/') ? 'page' : undefined}>首页</Link>
          <Link to="/discover" className={navClass('/discover')} aria-current={isActive('/discover') ? 'page' : undefined}>发现</Link>
          <Link to="/pets" className={navClass('/pets')} aria-current={isActive('/pets') ? 'page' : undefined}>宠物</Link>
          <Link to="/activities" className={navClass('/activities')} aria-current={isActive('/activities') ? 'page' : undefined}>活动</Link>
          <Link to="/topics" className={navClass('/topics')} aria-current={isActive('/topics') ? 'page' : undefined}>话题</Link>
          <Link to="/adopts" className={navClass('/adopts')} aria-current={isActive('/adopts') ? 'page' : undefined}>领养</Link>
          <Link to="/ranking" className={navClass('/ranking')} aria-current={isActive('/ranking') ? 'page' : undefined}>排行榜</Link>
        </nav>

        <div className="header-actions">
          {isLoggedIn ? (
            <div className="user-menu">
              <Link to="/search" className="action-link" aria-label="搜索">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
              </Link>
              <Link to="/notifications" className="action-link action-link--secondary" aria-label="通知">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </Link>
              <Link to="/messages" className="action-link action-link--secondary" aria-label="私信">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
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
              <Link to="/login">
                <Button variant="ghost" size="sm">登录</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">注册</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
