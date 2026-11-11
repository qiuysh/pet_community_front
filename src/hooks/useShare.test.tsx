import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock('../components/toast', () => {
  const api = {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  };
  return { useToast: () => api };
});

import { useShare } from './useShare';

describe('useShare 分享接缝', () => {
  const record = vi.fn();
  const onCountChange = vi.fn();

  const renderShare = () =>
    renderHook(() =>
      useShare({
        record,
        onCountChange,
        resolveTarget: () => ({ url: 'https://example.com/posts/1', title: '标题' }),
      }),
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('打开面板只生成本地链接，不上报', () => {
    const { result } = renderShare();

    act(() => {
      result.current.openShare();
    });

    expect(result.current.shareOpen).toBe(true);
    expect(result.current.shareUrl).toBe('https://example.com/posts/1');
    expect(result.current.shareTitle).toBe('标题');
    expect(record).not.toHaveBeenCalled();
  });

  it('选定平台后上报并乐观 +1', async () => {
    record.mockResolvedValue(undefined);
    const { result } = renderShare();

    await act(async () => {
      await result.current.onShare('weibo');
    });

    expect(record).toHaveBeenCalledWith('weibo');
    expect(onCountChange).toHaveBeenNthCalledWith(1, 1);
    expect(toastSuccess).toHaveBeenCalledWith('分享成功');
  });

  it('上报失败回滚 -1 并提示', async () => {
    record.mockRejectedValue(new Error('网络异常'));
    const { result } = renderShare();

    await act(async () => {
      await result.current.onShare('link');
    });

    expect(onCountChange).toHaveBeenNthCalledWith(1, 1);
    expect(onCountChange).toHaveBeenNthCalledWith(2, -1);
    expect(toastError).toHaveBeenCalledWith('网络异常');
  });

  it('关闭面板后状态复位', () => {
    const { result } = renderShare();

    act(() => {
      result.current.openShare();
    });
    act(() => {
      result.current.closeShare();
    });

    expect(result.current.shareOpen).toBe(false);
  });
});
