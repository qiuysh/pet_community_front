import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QuickActions } from './quickActions';

describe('QuickActions', () => {
  it('渲染默认快捷操作（审核/举报/广告/活动/报表）', () => {
    render(
      <MemoryRouter>
        <QuickActions />
      </MemoryRouter>,
    );
    expect(screen.getByText('快捷操作')).toBeInTheDocument();
    expect(screen.getByText('内容审核')).toBeInTheDocument();
    expect(screen.getByText('举报管理')).toBeInTheDocument();
    expect(screen.getByText('广告管理')).toBeInTheDocument();
    expect(screen.getByText('活动管理')).toBeInTheDocument();
    expect(screen.getByText('分析报表')).toBeInTheDocument();
    expect(screen.queryByText('系统设置')).not.toBeInTheDocument();
    expect(screen.queryByText('用户管理')).not.toBeInTheDocument();
  });

  it('操作项使用 Link 指向对应路由', () => {
    render(
      <MemoryRouter>
        <QuickActions />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /内容审核/ })).toHaveAttribute('href', '/admin/reviews');
    expect(screen.getByRole('link', { name: /分析报表/ })).toHaveAttribute('href', '/admin/analytics');
    expect(screen.getByRole('link', { name: /活动管理/ })).toHaveAttribute('href', '/admin/activities/create');
  });

  it('使用自定义 actions 替换默认项', () => {
    const customActions = [
      { key: 'custom1', label: '自定义A', icon: <span data-testid="icon-a">A</span>, link: '/a', color: 'bg-red-50 text-red-600' },
      { key: 'custom2', label: '自定义B', icon: <span data-testid="icon-b">B</span>, link: '/b', color: 'bg-yellow-50 text-yellow-600' },
    ];
    render(
      <MemoryRouter>
        <QuickActions actions={customActions} />
      </MemoryRouter>,
    );
    expect(screen.getByText('自定义A')).toBeInTheDocument();
    expect(screen.getByText('自定义B')).toBeInTheDocument();
    expect(screen.queryByText('内容审核')).not.toBeInTheDocument();
  });

  it('自定义项 Link 指向对应链接', () => {
    const customActions = [
      { key: 'custom', label: '点击我', icon: <span>X</span>, link: '/custom', color: 'bg-red-50' },
    ];
    render(
      <MemoryRouter>
        <QuickActions actions={customActions} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /点击我/ })).toHaveAttribute('href', '/custom');
  });
});
