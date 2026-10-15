import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockUseUserStore = vi.fn();

vi.mock('../../stores/userStore', () => ({
  useUserStore: () => mockUseUserStore(),
}));

import { UserTabBar } from './userTabBar';

const renderWithRouter = (initialPath: string = '/', loggedIn: boolean = false) => {
  mockUseUserStore.mockReturnValue({ isLoggedIn: loggedIn });
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <UserTabBar />
    </MemoryRouter>
  );
};

describe('UserTabBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染所有底部导航项', () => {
    renderWithRouter();
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('发现')).toBeInTheDocument();
    expect(screen.getByText('活动')).toBeInTheDocument();
    expect(screen.getByText('领养')).toBeInTheDocument();
    expect(screen.getByText('我的')).toBeInTheDocument();
  });

  it('未登录不显示发帖按钮', () => {
    renderWithRouter('/', false);
    expect(screen.queryByText('发帖')).not.toBeInTheDocument();
  });

  it('已登录显示发帖按钮', () => {
    renderWithRouter('/', true);
    expect(screen.getByLabelText('发布动态')).toBeInTheDocument();
  });

  it('首页路由激活', () => {
    renderWithRouter('/');
    const homeLink = screen.getByText('首页').closest('a');
    expect(homeLink).toHaveClass('active');
  });

  it('/posts 路由也激活首页', () => {
    renderWithRouter('/posts');
    const homeLink = screen.getByText('首页').closest('a');
    expect(homeLink).toHaveClass('active');
  });

  it('发现路由激活', () => {
    renderWithRouter('/discover');
    const discoverLink = screen.getByText('发现').closest('a');
    expect(discoverLink).toHaveClass('active');
  });

  it('领养路由激活', () => {
    renderWithRouter('/adopts');
    const adoptLink = screen.getByText('领养').closest('a');
    expect(adoptLink).toHaveClass('active');
  });

  it('活动路由激活', () => {
    renderWithRouter('/activities');
    const activityLink = screen.getByText('活动').closest('a');
    expect(activityLink).toHaveClass('active');
  });

  it('settings 路由激活我的', () => {
    renderWithRouter('/settings');
    const userLink = screen.getByText('我的').closest('a');
    expect(userLink).toHaveClass('active');
  });

  it('积分页面激活我的', () => {
    renderWithRouter('/points');
    const userLink = screen.getByText('我的').closest('a');
    expect(userLink).toHaveClass('active');
  });

  it('通知设置页面激活我的', () => {
    renderWithRouter('/notification-settings');
    const userLink = screen.getByText('我的').closest('a');
    expect(userLink).toHaveClass('active');
  });

  it('所有 tab 都有正确的 href', () => {
    renderWithRouter();
    expect(screen.getByText('首页').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('发现').closest('a')).toHaveAttribute('href', '/discover');
    expect(screen.getByText('活动').closest('a')).toHaveAttribute('href', '/activities');
    expect(screen.getByText('领养').closest('a')).toHaveAttribute('href', '/adopts');
    expect(screen.getByText('我的').closest('a')).toHaveAttribute('href', '/settings');
  });

  it('发帖链接指向 /posts/create', () => {
    renderWithRouter('/', true);
    expect(screen.getByText('发帖').closest('a')).toHaveAttribute('href', '/posts/create');
  });

  it('发布动态页不显示发帖 FAB，避免遮挡存草稿/草稿箱', () => {
    renderWithRouter('/posts/create', true);
    expect(screen.queryByLabelText('发布动态')).not.toBeInTheDocument();
  });

  it('草稿箱页不显示发帖 FAB', () => {
    renderWithRouter('/posts/drafts', true);
    expect(screen.queryByLabelText('发布动态')).not.toBeInTheDocument();
  });

  it('编辑动态页不显示发帖 FAB', () => {
    renderWithRouter('/posts/12/edit', true);
    expect(screen.queryByLabelText('发布动态')).not.toBeInTheDocument();
  });
});
