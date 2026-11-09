import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '../toast';

vi.mock('../../api/admin', () => ({
  pinPost: vi.fn(),
  featurePost: vi.fn(),
}));

import { pinPost, featurePost } from '../../api/admin';
import { PostPinAction } from './postPinAction';

const renderWithToast = (ui: React.ReactNode) =>
  render(<ToastProvider>{ui}</ToastProvider>);

describe('PostPinAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(pinPost).mockResolvedValue(undefined as never);
    vi.mocked(featurePost).mockResolvedValue(undefined as never);
  });

  it('渲染置顶与精选按钮', () => {
    renderWithToast(<PostPinAction postId={12} />);
    expect(screen.getByRole('button', { name: '置顶动态' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '设为精选' })).toBeTruthy();
  });

  it('置顶后再次点击可取消，并回调刷新', async () => {
    const onSuccess = vi.fn();
    renderWithToast(<PostPinAction postId={12} onSuccess={onSuccess} />);

    fireEvent.click(screen.getByRole('button', { name: '置顶动态' }));
    await waitFor(() => expect(pinPost).toHaveBeenCalledWith(12, 1));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: '取消置顶' }));
    await waitFor(() => expect(pinPost).toHaveBeenCalledWith(12, 0));
  });

  it('精选走 featurePost 接口', async () => {
    renderWithToast(<PostPinAction postId={12} />);
    fireEvent.click(screen.getByRole('button', { name: '设为精选' }));
    await waitFor(() => expect(featurePost).toHaveBeenCalledWith(12, 1));
  });
});
