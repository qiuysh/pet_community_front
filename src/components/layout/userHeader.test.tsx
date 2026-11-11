import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockUseUserStore = vi.fn();
const mockUseSiteConfigStore = vi.fn();
const mockUseNavUnreadCounts = vi.fn();

vi.mock('../../stores/userStore', () => ({
  useUserStore: () => mockUseUserStore(),
}));
vi.mock('../../stores/siteConfigStore', () => ({
  useSiteConfigStore: (selector: (s: { siteName: string; siteLogo: string }) => unknown) =>
    selector(mockUseSiteConfigStore()),
}));
vi.mock('../../hooks/useNavUnreadCounts', () => ({
  useNavUnreadCounts: () => mockUseNavUnreadCounts(),
}));

import { UserHeader } from './userHeader';
import { USER_HEADER_NAV, USER_MOBILE_MORE_NAV } from './userNav';

describe('UserHeader 导航覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSiteConfigStore.mockReturnValue({ siteName: '宠友社区', siteLogo: '' });
    mockUseNavUnreadCounts.mockReturnValue({ messageUnread: 0, notificationUnread: 0 });
    mockUseUserStore.mockReturnValue({
      isLoggedIn: false,
      user: null,
      logout: vi.fn(),
    });
  });

  it('PC 主导航含全部入口', () => {
    render(
      <MemoryRouter>
        <UserHeader />
      </MemoryRouter>,
    );
    const nav = screen.getByRole('navigation', { name: '主导航' });
    for (const item of USER_HEADER_NAV) {
      expect(nav).toHaveTextContent(item.label);
    }
  });

  it('提供移动端「更多导航」以补齐底栏缺失入口', () => {
    render(
      <MemoryRouter>
        <UserHeader />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: '更多导航' })).toBeInTheDocument();
    // 底栏没有的三项必须在更多清单里
    expect(USER_MOBILE_MORE_NAV.map((i) => i.label)).toEqual(['宠物', '话题', '排行榜']);
  });
});
