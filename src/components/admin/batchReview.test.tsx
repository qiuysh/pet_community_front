import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '../toast';

vi.mock('../../api/admin', () => ({
  batchReview: vi.fn(),
}));

import { batchReview } from '../../api/admin';
import { BatchReview } from './batchReview';
import { ReviewContent } from '../../types/admin';

const renderWithToast = (ui: React.ReactNode) =>
  render(<ToastProvider>{ui}</ToastProvider>);

const baseItems: ReviewContent[] = [
  { id: 1, type: 'post', content: '内容1', userId: 1, username: 'u1', avatar: '', status: 0, createdAt: '2024-01-01' },
  { id: 2, type: 'post', content: '内容2', userId: 1, username: 'u1', avatar: '', status: 0, createdAt: '2024-01-01' },
  { id: 3, type: 'post', content: '内容3', userId: 1, username: 'u1', avatar: '', status: 0, createdAt: '2024-01-01' },
];

describe('BatchReview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染批量审核弹窗', () => {
    renderWithToast(
      <BatchReview selectedItems={baseItems} onSuccess={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByText('批量审核')).toBeInTheDocument();
    expect(screen.getByText('已选择 3 条记录')).toBeInTheDocument();
  });

  it('默认选中全部通过', () => {
    renderWithToast(
      <BatchReview selectedItems={baseItems} onSuccess={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByRole('button', { name: '确认通过' })).toBeInTheDocument();
  });

  it('点击全部通过调用 batchReview', async () => {
    vi.mocked(batchReview).mockResolvedValue({} as any);
    const onSuccess = vi.fn();
    renderWithToast(
      <BatchReview selectedItems={baseItems} onSuccess={onSuccess} onCancel={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: '确认通过' }));
    await waitFor(() => {
      expect(batchReview).toHaveBeenCalledWith({
        targetType: 'post',
        ids: [1, 2, 3],
        status: 1,
        reason: undefined,
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('选择全部拒绝显示原因输入框', () => {
    renderWithToast(
      <BatchReview selectedItems={baseItems} onSuccess={() => {}} onCancel={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: '全部拒绝' }));
    expect(screen.getByText('拒绝原因')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入拒绝原因，将统一通知所有用户')).toBeInTheDocument();
  });

  it('拒绝时空原因提示错误', async () => {
    const errorSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithToast(
      <BatchReview selectedItems={baseItems} onSuccess={() => {}} onCancel={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: '全部拒绝' }));
    fireEvent.click(screen.getByRole('button', { name: '确认拒绝' }));
    await waitFor(() => {
      expect(batchReview).not.toHaveBeenCalled();
    });
    errorSpy.mockRestore();
  });

  it('填写原因后拒绝成功', async () => {
    vi.mocked(batchReview).mockResolvedValue({} as any);
    const onSuccess = vi.fn();
    renderWithToast(
      <BatchReview selectedItems={baseItems} onSuccess={onSuccess} onCancel={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: '全部拒绝' }));
    fireEvent.change(screen.getByPlaceholderText('请输入拒绝原因，将统一通知所有用户'), { target: { value: '违规' } });
    fireEvent.click(screen.getByRole('button', { name: '确认拒绝' }));
    await waitFor(() => {
      expect(batchReview).toHaveBeenCalledWith({
        targetType: 'post',
        ids: [1, 2, 3],
        status: 2,
        reason: '违规',
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('点击取消触发 onCancel', () => {
    const onCancel = vi.fn();
    renderWithToast(
      <BatchReview selectedItems={baseItems} onSuccess={() => {}} onCancel={onCancel} />
    );
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('无选中项时使用默认 targetType', async () => {
    vi.mocked(batchReview).mockResolvedValue({} as any);
    const onSuccess = vi.fn();
    renderWithToast(
      <BatchReview selectedItems={[]} onSuccess={onSuccess} onCancel={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: '确认通过' }));
    await waitFor(() => {
      expect(batchReview).toHaveBeenCalledWith(expect.objectContaining({
        targetType: 'post',
        ids: [],
      }));
    });
  });
});
