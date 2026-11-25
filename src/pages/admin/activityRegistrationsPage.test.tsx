import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../api/activity', () => ({
  getActivityDetail: vi.fn(async () => ({ id: 3, title: '测试活动' })),
  getRegistrationList: vi.fn(async () => ({ list: [], total: 0 })),
  reviewRegistration: vi.fn(async () => undefined),
}));
vi.mock('../../utils/toastManager', () => ({
  showErrorToast: vi.fn(),
  showSuccessToast: vi.fn(),
}));
vi.mock('../../hooks/useConfirm', () => ({
  useConfirm: () => ({ confirm: vi.fn(async () => true), confirmDialog: null }),
}));

import { ActivityRegistrationsPage } from './activityRegistrationsPage';

describe('ActivityRegistrationsPage', () => {
  it('返回列表按钮用加深灰底，与白色页头区分', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/activities/3/registrations']}>
        <Routes>
          <Route
            path="/admin/activities/:id/registrations"
            element={<ActivityRegistrationsPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText('暂无报名记录');
    const link = screen.getByRole('link', { name: '返回列表' });
    expect(link.className).toContain('[&&]:!bg-muted');
    expect(link.className).toContain('[&&]:hover:!bg-border');
  });
});
