import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '../toast';

vi.mock('../../api/admin', () => ({
  approveReview: vi.fn(),
  rejectReview: vi.fn(),
}));

import { approveReview, rejectReview } from '../../api/admin';
import { ReviewAction } from './reviewAction';
import { ReviewContent } from '../../types/admin';

const renderWithToast = (ui: React.ReactNode) =>
  render(<ToastProvider>{ui}</ToastProvider>);

const baseContent: ReviewContent = {
  id: 1,
  type: 'post',
  content: '待审核内容',
  userId: 1,
  username: 'user1',
  avatar: '',
  status: 0,
  createdAt: '2024-01-01 10:00:00',
};

describe('ReviewAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染通过和拒绝按钮', () => {
    renderWithToast(
      <ReviewAction content={baseContent} onSuccess={() => {}} />
    );
    expect(screen.getByRole('button', { name: '通过' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '拒绝' })).toBeInTheDocument();
  });

  it('点击通过调用 approveReview', async () => {
    vi.mocked(approveReview).mockResolvedValue({} as any);
    const onSuccess = vi.fn();
    renderWithToast(
      <ReviewAction content={baseContent} onSuccess={onSuccess} />
    );
    fireEvent.click(screen.getByRole('button', { name: '通过' }));
    await waitFor(() => {
      expect(approveReview).toHaveBeenCalledWith({
        targetType: 'post',
        id: 1,
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('点击通过失败时显示错误', async () => {
    vi.mocked(approveReview).mockRejectedValue(new Error('审核失败'));
    const onSuccess = vi.fn();
    renderWithToast(
      <ReviewAction content={baseContent} onSuccess={onSuccess} />
    );
    fireEvent.click(screen.getByRole('button', { name: '通过' }));
    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  it('点击拒绝打开拒绝原因弹窗', () => {
    renderWithToast(
      <ReviewAction content={baseContent} onSuccess={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: '拒绝' }));
    expect(screen.getByText('拒绝审核')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入拒绝原因，将通知用户')).toBeInTheDocument();
  });

  it('取消按钮关闭拒绝弹窗', () => {
    renderWithToast(
      <ReviewAction content={baseContent} onSuccess={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: '拒绝' }));
    expect(screen.getByText('拒绝审核')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(screen.queryByText('拒绝审核')).not.toBeInTheDocument();
  });

  it('空原因时点击确认拒绝提示填写原因', async () => {
    const errorSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithToast(
      <ReviewAction content={baseContent} onSuccess={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: '拒绝' }));
    fireEvent.click(screen.getByRole('button', { name: '确认拒绝' }));
    await waitFor(() => {
      expect(rejectReview).not.toHaveBeenCalled();
    });
    errorSpy.mockRestore();
  });

  it('填写原因后确认拒绝调用 rejectReview', async () => {
    vi.mocked(rejectReview).mockResolvedValue({} as any);
    const onSuccess = vi.fn();
    renderWithToast(
      <ReviewAction content={baseContent} onSuccess={onSuccess} />
    );
    fireEvent.click(screen.getByRole('button', { name: '拒绝' }));
    fireEvent.change(screen.getByPlaceholderText('请输入拒绝原因，将通知用户'), { target: { value: '内容违规' } });
    fireEvent.click(screen.getByRole('button', { name: '确认拒绝' }));
    await waitFor(() => {
      expect(rejectReview).toHaveBeenCalledWith({
        targetType: 'post',
        id: 1,
        reason: '内容违规',
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
