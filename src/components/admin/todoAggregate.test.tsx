import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TodoAggregate } from './todoAggregate';

describe('TodoAggregate', () => {
  it('渲染标题', () => {
    render(
      <MemoryRouter>
        <TodoAggregate data={null} />
      </MemoryRouter>,
    );
    expect(screen.getByText('待办事项')).toBeInTheDocument();
  });

  it('无数据时显示空状态', () => {
    render(
      <MemoryRouter>
        <TodoAggregate data={null} />
      </MemoryRouter>,
    );
    expect(screen.getByText('暂无待办事项')).toBeInTheDocument();
  });

  it('空 items 数组时显示空状态', () => {
    render(
      <MemoryRouter>
        <TodoAggregate data={{ total: 0, items: [] }} />
      </MemoryRouter>,
    );
    expect(screen.getByText('暂无待办事项')).toBeInTheDocument();
  });

  it('渲染待办列表', () => {
    const data = {
      total: 5,
      items: [
        { key: 'review', label: '内容审核', count: 3, link: '/admin/reviews' },
        { key: 'registrations', label: '待审活动报名', count: 2, link: '/admin/activities?focus=registrations' },
      ],
    };
    render(
      <MemoryRouter>
        <TodoAggregate data={data} />
      </MemoryRouter>,
    );
    expect(screen.getByText('内容审核')).toBeInTheDocument();
    expect(screen.getByText('待审活动报名')).toBeInTheDocument();
    expect(screen.getByText('共 5 项')).toBeInTheDocument();
  });

  it('待办项使用 Link 指向对应路由', () => {
    const data = {
      total: 1,
      items: [{ key: 'review', label: '内容审核', count: 1, link: '/admin/reviews' }],
    };
    render(
      <MemoryRouter>
        <TodoAggregate data={data} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /内容审核/ })).toHaveAttribute('href', '/admin/reviews');
  });

  it('count=0 时不显示 badge', () => {
    const data = {
      total: 0,
      items: [{ key: 'review', label: '内容审核', count: 0, link: '/admin/reviews' }],
    };
    render(
      <MemoryRouter>
        <TodoAggregate data={data} />
      </MemoryRouter>,
    );
    expect(screen.queryByText(/共 \d+ 项/)).not.toBeInTheDocument();
  });
});
