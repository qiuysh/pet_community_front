import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { UserHeader } from './userHeader';
import { UserTabBar } from './userTabBar';
import { SiteFooter } from './siteFooter';
import './userLayout.scss';

interface UserLayoutProps {
  children: ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  // key 变化让页面容器重新挂载，配合 .motion-page-enter 做一次性淡入（只动 opacity）
  const { pathname } = useLocation();

  return (
    <div className="user-layout">
      <a href="#main-content" className="skip-link">跳到主要内容</a>
      <UserHeader />
      <main id="main-content" className="user-main">
        <div className="user-content motion-page-enter" key={pathname}>
          {children}
        </div>
      </main>
      <SiteFooter />
      <UserTabBar />
    </div>
  );
}
