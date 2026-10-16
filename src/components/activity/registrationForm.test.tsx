import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '../toast';

vi.mock('../../api/activity', () => ({
  createRegistration: vi.fn(),
}));

import { createRegistration } from '../../api/activity';
import { RegistrationForm } from './registrationForm';
import { ActivityInfo, ActivityType, ActivityStatus } from '../../types/activity';

const renderWithToast = (ui: React.ReactNode) =>
  render(<ToastProvider>{ui}</ToastProvider>);

const baseActivity: ActivityInfo = {
  id: 1,
  title: '测试活动',
  description: '描述',
  type: ActivityType.VOTING,
  cover: 'https://example.com/cover.jpg',
  startTime: '2024-06-15T10:00:00Z',
  endTime: '2024-06-20T18:00:00Z',
  participantsCount: 0,
  submissionsCount: 0,
  status: ActivityStatus.PUBLISHED,
  createdAt: '2024-06-01T10:00:00Z',
  updatedAt: '2024-06-01T10:00:00Z',
  isRegistered: false,
};

describe('RegistrationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染表单字段', () => {
    renderWithToast(<RegistrationForm activity={baseActivity} />);
    expect(screen.getByText(/姓名/)).toBeInTheDocument();
    expect(screen.getByText(/手机号/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '提交报名' })).toBeInTheDocument();
  });

  it('空内容提交时不调用 API', async () => {
    renderWithToast(<RegistrationForm activity={baseActivity} />);
    fireEvent.click(screen.getByRole('button', { name: '提交报名' }));
    await waitFor(() => {
      expect(createRegistration).not.toHaveBeenCalled();
    });
  });

  it('提交成功调用 createRegistration', async () => {
    vi.mocked(createRegistration).mockResolvedValue({} as any);
    const onSuccess = vi.fn();
    renderWithToast(<RegistrationForm activity={baseActivity} onSuccess={onSuccess} />);
    fireEvent.change(screen.getByPlaceholderText('请输入真实姓名'), { target: { value: '张三' } });
    fireEvent.change(screen.getByPlaceholderText('请输入手机号'), { target: { value: '13800138000' } });
    fireEvent.click(screen.getByRole('button', { name: '提交报名' }));
    await waitFor(() => {
      expect(createRegistration).toHaveBeenCalledWith({
        activityId: 1,
        name: '张三',
        phone: '13800138000',
        message: undefined,
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
