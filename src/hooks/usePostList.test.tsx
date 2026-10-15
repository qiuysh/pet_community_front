import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';

const toastError = vi.fn();

vi.mock('../components/toast', () => ({
  useToast: () => ({ error: toastError }),
}));

const getPostListMock = vi.fn();

vi.mock('../api/post', () => ({
  getPostList: (...args: unknown[]) => getPostListMock(...args),
}));

import { usePostList } from './usePostList';
import { PostInfo } from '../types/post';

const buildPost = (id: number): PostInfo => ({
  id,
  userId: id,
  userNickname: `user${id}`,
  userAvatar: '',
  content: `content ${id}`,
  visibility: 0,
  likesCount: 0,
  commentsCount: 0,
  sharesCount: 0,
  favoritesCount: 0,
  isPinned: 0,
  isFeatured: 0,
  isLiked: false,
  isFavorited: false,
  status: 1,
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

describe('usePostList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('默认查询参数为 tab=all, page=1', async () => {
    getPostListMock.mockResolvedValue({ list: [buildPost(1)], total: 1 });

    const { result } = renderWithRouter();

    expect(result.current.hook.tab).toBe('all');
    expect(result.current.hook.page).toBe(1);

    await waitFor(() => {
      expect(getPostListMock).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        type: undefined,
      });
    });
  });

  it('成功加载动态列表', async () => {
    const posts = [buildPost(1), buildPost(2)];
    getPostListMock.mockResolvedValue({ list: posts, total: 2 });

    const { result } = renderWithRouter();

    await waitFor(() => {
      expect(result.current.hook.posts).toHaveLength(2);
      expect(result.current.hook.total).toBe(2);
      expect(result.current.hook.totalPages).toBe(1);
    });
  });

  it('加载失败时显示错误提示', async () => {
    getPostListMock.mockRejectedValue(new Error('加载失败'));

    const { result } = renderWithRouter();

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith('加载动态失败');
    });
    expect(result.current.hook.posts).toEqual([]);
  });

  it('type 参数随 tab 变化(image)', async () => {
    getPostListMock.mockResolvedValue({ list: [], total: 0 });

    renderWithRouter('/?tab=image&page=1');

    await waitFor(() => {
      expect(getPostListMock).toHaveBeenCalledWith(expect.objectContaining({ type: 'image' }));
    });
  });

  it('totalPages 基于 pageSize 计算', async () => {
    getPostListMock.mockResolvedValue({ list: [], total: 25 });

    const { result } = renderWithRouter();

    await waitFor(() => {
      expect(result.current.hook.totalPages).toBe(3); // 25/10 = 2.5 -> 3
    });
  });

  it('空列表时 posts 与 total 均为 0', async () => {
    getPostListMock.mockResolvedValue({ list: [], total: 0 });

    const { result } = renderWithRouter();

    await waitFor(() => {
      expect(result.current.hook.posts).toEqual([]);
      expect(result.current.hook.total).toBe(0);
    });
  });

  it('loading 状态在请求完成后切换为 false', async () => {
    getPostListMock.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ list: [], total: 0 }), 10)));

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
