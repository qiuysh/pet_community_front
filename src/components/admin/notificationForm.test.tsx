import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '../toast';

vi.mock('../../api/admin', () => ({
  createNotification: vi.fn(),
  updateNotification: vi.fn(),
}));

import { createNotification, updateNotification } from '../../api/admin';
import { NotificationForm } from './notificationForm';
import { SystemNotification } from '../../types/admin';

const renderWithToast = (ui: React.ReactNode) =>
  render(<ToastProvider>{ui}</ToastProvider>);

const baseNotification: SystemNotification = {
  id: 1,
  title: '系统通知',
  content: '通知内容',
  type: 1,
  status: 0,
  targetType: 0,
  targetIds: '',
  publishAt: '',
  adminId: 1,
  createdAt: '2024-06-01',
  updatedAt: '2024-06-01',
};

describe('NotificationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染创建表单', () => {
    renderWithToast(
      <NotificationForm onClose={() => {}} onSuccess={() => {}} />
    );
    expect(screen.getByText('发布通知')).toBeInTheDocument();
    expect(screen.getByText(/通知标题/)).toBeInTheDocument();
    expect(screen.getByText(/通知内容/)).toBeInTheDocument();
  });

  it('渲染编辑表单', () => {
    renderWithToast(
      <NotificationForm notification={baseNotification} onClose={() => {}} onSuccess={() => {}} />
    );
    expect(screen.getByText('编辑通知')).toBeInTheDocument();
  });

  it('关闭按钮触发 onClose', () => {
    const onClose = vi.fn();
    const { container } = renderWithToast(
      <NotificationForm onClose={onClose} onSuccess={() => {}} />
    );
    const closeBtn = container.querySelector('button svg')?.parentElement;
    if (closeBtn) fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('取消按钮触发 onClose', () => {
    const onClose = vi.fn();
    renderWithToast(
      <NotificationForm onClose={onClose} onSuccess={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('空标题时显示错误', async () => {
    renderWithToast(
      <NotificationForm onClose={() => {}} onSuccess={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: '保存通知' }));
    await waitFor(() => {
      expect(screen.getByText('请填写完整信息')).toBeInTheDocument();
    });
    expect(createNotification).not.toHaveBeenCalled();
  });

  it('创建通知成功', async () => {
    vi.mocked(createNotification).mockResolvedValue({} as any);
    const onSuccess = vi.fn();
    renderWithToast(
      <NotificationForm onClose={() => {}} onSuccess={onSuccess} />
    );
    fireEvent.change(screen.getByPlaceholderText('请输入通知标题'), { target: { value: '新通知' } });
    fireEvent.change(screen.getByPlaceholderText('请输入通知内容'), { target: { value: '新内容' } });
    fireEvent.click(screen.getByRole('button', { name: '保存通知' }));
    await waitFor(() => {
      expect(createNotification).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('编辑通知调用 updateNotification', async () => {
    vi.mocked(updateNotification).mockResolvedValue({} as any);
    const onSuccess = vi.fn();
    renderWithToast(
      <NotificationForm notification={baseNotification} onClose={() => {}} onSuccess={onSuccess} />
    );
    fireEvent.click(screen.getByRole('button', { name: '保存修改' }));
    await waitFor(() => {
      expect(updateNotification).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('目标用户选项显示', () => {
    renderWithToast(
      <NotificationForm onClose={() => {}} onSuccess={() => {}} />
    );
    expect(screen.getByText('全部用户')).toBeInTheDocument();
  });
});
