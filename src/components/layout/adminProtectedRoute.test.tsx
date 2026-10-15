import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const mockUseAdminStore = vi.fn();

vi.mock('../../stores/adminStore', () => ({
  useAdminStore: (selector?: (s: { token: string | null }) => unknown) => {
    const state = mockUseAdminStore();
    return typeof selector === 'function' ? selector(state) : state;
  },
}));

import { AdminProtectedRoute } from './adminProtectedRoute';

describe('AdminProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('无 token 时跳转后台登录页', () => {
    mockUseAdminStore.mockReturnValue({ token: null });
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <div data-testid="admin-content">后台内容</div>
              </AdminProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<div data-testid="admin-login">后台登录</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('admin-login')).toBeInTheDocument();
  });

  it('有 token 时显示受保护内容', () => {
    mockUseAdminStore.mockReturnValue({ token: 'admin-token' });
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <div data-testid="admin-content">后台内容</div>
              </AdminProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<div data-testid="admin-login">后台登录</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
  });
});
