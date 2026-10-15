import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '../toast';

vi.mock('../../api/admin', () => ({
  createAnnouncement: vi.fn(),
  updateAnnouncement: vi.fn(),
}));

import { createAnnouncement, updateAnnouncement } from '../../api/admin';
import { AnnouncementForm } from './announcementForm';
import { Announcement } from '../../types/admin';

const renderWithToast = (ui: React.ReactNode) =>
  render(<ToastProvider>{ui}</ToastProvider>);

const baseAnnouncement: Announcement = {
  id: 1,
  title: '系统维护通知',
  content: '系统将于今晚 22:00 维护',
  type: 1,
  sortOrder: 10,
  startAt: '2024-06-15T00:00:00Z',
  endAt: '2024-06-30T23:59:59Z',
  status: 1,
  adminId: 1,
  createdAt: '2024-06-01 10:00:00',
  updatedAt: '2024-06-01 10:00:00',
};

describe('AnnouncementForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染创建公告表单', () => {
    renderWithToast(
      <AnnouncementForm onClose={() => {}} onSuccess={() => {}} />
    );
    expect(screen.getAllByText('发布公告').length).toBeGreaterThan(0);
    expect(screen.getByText(/公告标题/)).toBeInTheDocument();
    expect(screen.getByText(/公告内容/)).toBeInTheDocument();
  });

  it('渲染编辑公告表单', () => {
    renderWithToast(
      <AnnouncementForm announcement={baseAnnouncement} onClose={() => {}} onSuccess={() => {}} />
    );
    expect(screen.getByText('编辑公告')).toBeInTheDocument();
    expect(screen.getByDisplayValue('系统维护通知')).toBeInTheDocument();
  });

  it('渲染所有公告类型选项', async () => {
    renderWithToast(
      <AnnouncementForm onClose={() => {}} onSuccess={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: /公告类型|系统公告/ }));
    expect(await screen.findByRole('option', { name: '系统公告' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '活动公告' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '维护公告' })).toBeInTheDocument();
  });

  it('关闭按钮触发 onClose', () => {
    const onClose = vi.fn();
    const { container } = renderWithToast(
      <AnnouncementForm onClose={onClose} onSuccess={() => {}} />
    );
    const closeButtons = container.querySelectorAll('button');
    const closeBtn = Array.from(closeButtons).find(btn => btn.querySelector('svg'));
    if (closeBtn) fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('取消按钮触发 onClose', () => {
    const onClose = vi.fn();
    renderWithToast(
      <AnnouncementForm onClose={onClose} onSuccess={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('空标题时显示错误', async () => {
    const errorSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithToast(
      <AnnouncementForm onClose={() => {}} onSuccess={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: '发布公告' }));
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
    expect(createAnnouncement).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('空内容时显示错误', async () => {
    const errorSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithToast(
      <AnnouncementForm onClose={() => {}} onSuccess={() => {}} />
    );
    const titleInput = screen.getByPlaceholderText('请输入公告标题');
    fireEvent.change(titleInput, { target: { value: '标题' } });
    fireEvent.click(screen.getByRole('button', { name: '发布公告' }));
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
    errorSpy.mockRestore();
  });

  it('创建公告成功', async () => {
    vi.mocked(createAnnouncement).mockResolvedValue({} as any);
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    renderWithToast(
      <AnnouncementForm onClose={onClose} onSuccess={onSuccess} />
    );
    fireEvent.change(screen.getByPlaceholderText('请输入公告标题'), { target: { value: '测试公告' } });
    fireEvent.change(screen.getByPlaceholderText('请输入公告内容'), { target: { value: '内容' } });
    fireEvent.click(screen.getByRole('button', { name: '发布公告' }));
    await waitFor(() => {
      expect(createAnnouncement).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('编辑公告调用 updateAnnouncement', async () => {
    vi.mocked(updateAnnouncement).mockResolvedValue({} as any);
    const onSuccess = vi.fn();
    renderWithToast(
      <AnnouncementForm announcement={baseAnnouncement} onClose={() => {}} onSuccess={onSuccess} />
    );
    fireEvent.click(screen.getByRole('button', { name: '保存修改' }));
    await waitFor(() => {
      expect(updateAnnouncement).toHaveBeenCalledWith(1, expect.objectContaining({
        title: '系统维护通知',
        content: '系统将于今晚 22:00 维护',
      }));
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('创建公告失败显示错误', async () => {
    vi.mocked(createAnnouncement).mockRejectedValue(new Error('error'));
    const errorSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithToast(
      <AnnouncementForm onClose={() => {}} onSuccess={() => {}} />
    );
    fireEvent.change(screen.getByPlaceholderText('请输入公告标题'), { target: { value: '标题' } });
    fireEvent.change(screen.getByPlaceholderText('请输入公告内容'), { target: { value: '内容' } });
    fireEvent.click(screen.getByRole('button', { name: '发布公告' }));
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
    errorSpy.mockRestore();
  });
});
