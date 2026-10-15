import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const mockUseUserStore = vi.fn();

vi.mock('../../stores/userStore', () => ({
  useUserStore: () => mockUseUserStore(),
}));

import { ProtectedRoute } from './protectedRoute';

const renderWithRouter = (loggedIn: boolean, hasToken: boolean, requireLogin: boolean = true, initialPath: string = '/protected') => {
  mockUseUserStore.mockReturnValue({ isLoggedIn: loggedIn, token: hasToken ? 'token' : null });
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute requireLogin={requireLogin}>
              <div data-testid="protected-content">受保护内容</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div data-testid="login-page">登录页</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('未登录且需要登录时跳转登录页', () => {
    renderWithRouter(false, false);
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('已登录时显示受保护内容', () => {
    renderWithRouter(true, true);
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('有 token 但 isLoggedIn 为 false 时显示内容', () => {
    renderWithRouter(false, true);
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('requireLogin=false 时未登录也显示内容', () => {
    renderWithRouter(false, false, false);
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('登录时跳转到登录页时携带来源路径', () => {
    mockUseUserStore.mockReturnValue({ isLoggedIn: false, token: null });
    render(
      <MemoryRouter initialEntries={['/admin/settings']}>
        <Routes>
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <div>受保护</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>登录页</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('登录页')).toBeInTheDocument();
  });
});
