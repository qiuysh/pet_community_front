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
  type: ActivityType.ONLINE_VOTE,
  cover: 'https://example.com/cover.jpg',
  startTime: '2024-06-15 10:00:00',
  endTime: '2024-06-20 18:00:00',
  currentParticipants: 0,
  status: ActivityStatus.PUBLISHED,
  organizerId: 1,
  organizerName: '组织者',
  createdAt: '2024-06-01 10:00:00',
  updatedAt: '2024-06-01 10:00:00',
  isRegistered: false,
};

describe('RegistrationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染表单字段', () => {
    renderWithToast(<RegistrationForm activity={baseActivity} />);
    expect(screen.getByText(/报名理由/)).toBeInTheDocument();
    expect(screen.getByText('上传图片（可选）')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '提交报名' })).toBeInTheDocument();
  });

  it('显示字数统计', () => {
    renderWithToast(<RegistrationForm activity={baseActivity} />);
    expect(screen.getByText('0/500')).toBeInTheDocument();
  });

  it('输入内容时更新字数', () => {
    renderWithToast(<RegistrationForm activity={baseActivity} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '我想参加' } });
    expect(screen.getByText('4/500')).toBeInTheDocument();
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
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '内容' } });
    fireEvent.click(screen.getByRole('button', { name: '提交报名' }));
    await waitFor(() => {
      expect(createRegistration).toHaveBeenCalledWith({
        activityId: 1,
        content: '内容',
        images: [],
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('提交失败不调用 onSuccess', async () => {
    vi.mocked(createRegistration).mockRejectedValue(new Error('失败'));
    const onSuccess = vi.fn();
    renderWithToast(<RegistrationForm activity={baseActivity} onSuccess={onSuccess} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '内容' } });
    fireEvent.click(screen.getByRole('button', { name: '提交报名' }));
    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  it('加载状态时按钮文本变化', async () => {
    vi.mocked(createRegistration).mockImplementation(() => new Promise(() => {}) as any);
    renderWithToast(<RegistrationForm activity={baseActivity} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '内容' } });
    fireEvent.click(screen.getByRole('button', { name: '提交报名' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '提交中...' })).toBeInTheDocument();
    });
  });
});
