import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { TopicDetailInfo } from '../types/discovery';

const getTopicDetailMock = vi.fn();
const shareTopicMock = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock('../api/discovery', () => ({
  getTopicDetail: (...args: unknown[]) => getTopicDetailMock(...args),
  shareTopic: (...args: unknown[]) => shareTopicMock(...args),
  participateTopic: vi.fn(),
}));

vi.mock('../api/post', () => ({
  getPostList: vi.fn().mockResolvedValue({ list: [], total: 0, page: 1, pageSize: 10 }),
}));

vi.mock('../components/toast', () => {
  // 必须返回稳定对象：useToast 每次返回新对象会让 loadTopic 的 useCallback 失效并触发无限重载
  const api = {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  };
  return { useToast: () => api };
});

import { useTopicDetail } from './useTopicDetail';

const buildTopic = (): TopicDetailInfo => ({
  id: 9,
  name: '宠物健康',
  description: '健康相关',
  cover: '',
  postsCount: 3,
  sharesCount: 2,
  status: 1,
  participantsCount: 5,
  isParticipated: false,
  createdAt: '2026-01-01T10:00:00Z',
});

const renderHookWithRouter = () =>
  renderHook(() => useTopicDetail(9), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });

describe('useTopicDetail 分享', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTopicDetailMock.mockResolvedValue(buildTopic());
    shareTopicMock.mockResolvedValue({ shareUrl: '/topics/9' });
  });

  it('openShare 只打开面板并生成本地链接，不请求接口', async () => {
    const { result } = renderHookWithRouter();
    await waitFor(() => expect(result.current.topic?.id).toBe(9));

    act(() => {
      result.current.openShare();
    });

    expect(result.current.shareOpen).toBe(true);
    expect(result.current.shareUrl).toBe(`${window.location.origin}/topics/9`);
    expect(shareTopicMock).not.toHaveBeenCalled();
  });

  it('选定平台后才按 platform 上报，并乐观累加分享数', async () => {
    const { result } = renderHookWithRouter();
    await waitFor(() => expect(result.current.topic?.sharesCount).toBe(2));

    await act(async () => {
      await result.current.onShare('weibo');
    });

    expect(shareTopicMock).toHaveBeenCalledWith(9, 'weibo');
    expect(result.current.topic?.sharesCount).toBe(3);
    expect(toastSuccess).toHaveBeenCalledWith('分享成功');
  });

  it('上报失败时回滚分享数并提示', async () => {
    shareTopicMock.mockRejectedValue(new Error('网络异常'));
    const { result } = renderHookWithRouter();
    await waitFor(() => expect(result.current.topic?.sharesCount).toBe(2));

    await act(async () => {
      await result.current.onShare('link');
    });

    expect(result.current.topic?.sharesCount).toBe(2);
    expect(toastError).toHaveBeenCalledWith('网络异常');
  });
});
