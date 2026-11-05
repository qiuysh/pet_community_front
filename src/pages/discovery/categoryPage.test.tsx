import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../../components/toast';
import type { RecommendPostInfo } from '../../types/discovery';

const getCategoryPostsMock = vi.fn();
const getTopicCategoriesMock = vi.fn();
const recordPostShareMock = vi.fn();

vi.mock('../../api/discovery', () => ({
  getCategoryPosts: (...args: unknown[]) => getCategoryPostsMock(...args),
  getTopicCategories: (...args: unknown[]) => getTopicCategoriesMock(...args),
}));

vi.mock('../../api/post', () => ({
  recordPostShare: (...args: unknown[]) => recordPostShareMock(...args),
  togglePostLike: vi.fn(),
  togglePostFavorite: vi.fn(),
}));

import { CategoryPage } from './categoryPage';

const basePost: RecommendPostInfo = {
  id: 42,
  userId: 7,
  userNickname: 'catlover',
  userAvatar: '',
  content: '分类页里的动态',
  images: [],
  video: '',
  likesCount: 3,
  commentsCount: 5,
  sharesCount: 1,
  isPinned: 0,
  isFeatured: 0,
  isLiked: false,
  isFavorited: false,
  createdAt: '2024-01-01 10:00:00',
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/category/1']}>
      <ToastProvider>
        <Routes>
          <Route path="/category/:id" element={<CategoryPage />} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  );

describe('CategoryPage 分享功能', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recordPostShareMock.mockResolvedValue(undefined);
    getTopicCategoriesMock.mockResolvedValue([
      { id: 1, name: '猫咪', description: '猫相关', cover: '', postsCount: 1, status: 1 },
    ]);
    getCategoryPostsMock.mockResolvedValue({ list: [basePost], total: 1, page: 1, pageSize: 10 });
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('分享是真实按钮：点击打开分享面板且不触发跳转', async () => {
    renderPage();

    const shareBtn = await screen.findByRole('button', { name: '分享' });
    fireEvent.click(shareBtn);

    expect(await screen.findByText('分享方式')).toBeInTheDocument();
    expect(recordPostShareMock).not.toHaveBeenCalled();
  });

  it('选择「复制链接」后上报分享数', async () => {
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: '分享' }));
    await screen.findByText('分享方式');

    const copyEntry = screen.getByText('复制链接').closest('button');
    expect(copyEntry).not.toBeNull();
    fireEvent.click(copyEntry as HTMLElement);

    await waitFor(() => {
      expect(recordPostShareMock).toHaveBeenCalledWith(basePost.id, { platform: 'link' });
    });
  });

  it('摘要卡不展示收藏按钮', async () => {
    renderPage();
    await screen.findByRole('button', { name: '分享' });
    expect(screen.queryByRole('button', { name: '收藏' })).toBeNull();
  });
});
