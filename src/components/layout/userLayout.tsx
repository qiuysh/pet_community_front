import { ReactNode } from 'react';
import { UserHeader } from './userHeader';
import { UserTabBar } from './userTabBar';
import './userLayout.scss';

interface UserLayoutProps {
  children: ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="user-layout">
      <a href="#main-content" className="skip-link">跳到主要内容</a>
      <UserHeader />
      <main id="main-content" className="user-main">
        <div className="user-content">
          {children}
        </div>
      </main>
      <UserTabBar />
    </div>
  );
}
