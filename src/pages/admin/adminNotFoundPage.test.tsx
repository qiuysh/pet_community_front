import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminNotFoundPage } from './adminNotFoundPage';

vi.mock('../../components/admin/adminButton', () => ({
  AdminButton: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('AdminNotFoundPage', () => {
  beforeEach(() => {
    document.title = '';
  });

  it('渲染后台 404 与驾驶舱入口', () => {
    render(
      <MemoryRouter>
        <AdminNotFoundPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '页面不存在' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '返回驾驶舱' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '返回上一页' })).toBeInTheDocument();
    expect(document.title).toContain('页面不存在');
  });
});
