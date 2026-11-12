import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';

const toastError = vi.fn();

vi.mock('../components/toast', () => ({
  useToast: () => ({ error: toastError }),
}));

const getRecommendPostsMock = vi.fn();

vi.mock('../api/discovery', () => ({
  getRecommendPosts: (...args: unknown[]) => getRecommendPostsMock(...args),
}));

import { HOME_FEED_PAGE_SIZE, usePostList } from './usePostList';

const buildRecommendItem = (id: number) => ({
  id,
  userId: id,
  userNickname: `user${id}`,
  userAvatar: '',
  content: `content ${id}`,
  likesCount: 0,
  commentsCount: 0,
  sharesCount: 0,
  isPinned: 0,
  isFeatured: 0,
  isLiked: false,
  isFavorited: false,
  createdAt: '2026-01-01 10:00:00',
});

const renderWithRouter = (initialPath = '/') => {
  return renderHook(
    () => {
      const [, setSearchParams] = useSearchParams();
      return { hook: usePostList(), setSearchParams };
    },
    {
      wrapper: ({ children }) => <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>,
    },
  );
};

describe('usePostList (HomeFeed → /recommend)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('默认走推荐流：tab=all, page=1, pageSize=20', async () => {
    getRecommendPostsMock.mockResolvedValue({ list: [buildRecommendItem(1)], total: 1, page: 1, pageSize: 20 });

    const { result } = renderWithRouter();

    expect(result.current.hook.tab).toBe('all');
    expect(result.current.hook.page).toBe(1);

    await waitFor(() => {
      expect(getRecommendPostsMock).toHaveBeenCalledWith(1, HOME_FEED_PAGE_SIZE, undefined);
    });
  });

  it('成功加载并映射为 PostInfo 列表', async () => {
    getRecommendPostsMock.mockResolvedValue({
      list: [buildRecommendItem(1), buildRecommendItem(2)],
      total: 2,
      page: 1,
      pageSize: 20,
    });

    const { result } = renderWithRouter();

    await waitFor(() => {
      expect(result.current.hook.posts).toHaveLength(2);
      expect(result.current.hook.total).toBe(2);
      expect(result.current.hook.totalPages).toBe(1);
      expect(result.current.hook.posts[0].status).toBe(1);
    });
  });

  it('加载失败时显示错误提示', async () => {
    getRecommendPostsMock.mockRejectedValue(new Error('加载失败'));

    const { result } = renderWithRouter();

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith('加载动态失败');
    });
    expect(result.current.hook.posts).toEqual([]);
  });

  it('图文 tab 把 type=image 传给推荐接口', async () => {
    getRecommendPostsMock.mockResolvedValue({ list: [], total: 0, page: 1, pageSize: 20 });

    renderWithRouter('/?tab=image&page=1');

    await waitFor(() => {
      expect(getRecommendPostsMock).toHaveBeenCalledWith(1, HOME_FEED_PAGE_SIZE, 'image');
    });
  });

  it('totalPages 基于推荐默认 pageSize=20 计算', async () => {
    getRecommendPostsMock.mockResolvedValue({ list: [], total: 45, page: 1, pageSize: 20 });

    const { result } = renderWithRouter();

    await waitFor(() => {
      expect(result.current.hook.totalPages).toBe(3);
    });
  });

  it('空列表时 posts 与 total 均为 0', async () => {
    getRecommendPostsMock.mockResolvedValue({ list: [], total: 0, page: 1, pageSize: 20 });

    const { result } = renderWithRouter();

    await waitFor(() => {
      expect(result.current.hook.posts).toEqual([]);
      expect(result.current.hook.total).toBe(0);
    });
  });

  it('loading 状态在请求完成后切换为 false', async () => {
    getRecommendPostsMock.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ list: [], total: 0, page: 1, pageSize: 20 }), 10)),
    );

    const { result } = renderWithRouter();

    await waitFor(() => {
      expect(result.current.hook.loading).toBe(true);
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
    });

    expect(result.current.hook.loading).toBe(false);
  });
});
