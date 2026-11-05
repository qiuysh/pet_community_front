import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../components/toast';
import { PostInfo } from '../../types/post';

const getPostListMock = vi.fn();
const recordPostShareMock = vi.fn();
const togglePostLikeMock = vi.fn();
const togglePostFavoriteMock = vi.fn();

vi.mock('../../api/post', () => ({
  getPostList: (...args: unknown[]) => getPostListMock(...args),
  recordPostShare: (...args: unknown[]) => recordPostShareMock(...args),
  togglePostLike: (...args: unknown[]) => togglePostLikeMock(...args),
  togglePostFavorite: (...args: unknown[]) => togglePostFavoriteMock(...args),
}));

vi.mock('../../components/ad/AdBanner', () => ({
  AdBanner: () => null,
}));

import { PostListPage } from './postListPage';

const basePost: PostInfo = {
  id: 42,
  userId: 7,
  userNickname: 'catlover',
  userAvatar: '',
  content: '今天我的猫做了个可爱的动作',
  images: [],
  video: '',
  location: '',
  visibility: 0,
  isLiked: false,
  likesCount: 3,
  isFavorited: false,
  favoritesCount: 1,
  sharesCount: 0,
  commentsCount: 5,
  isPinned: 0,
  isFeatured: 0,
  status: 1,
  createdAt: '2024-01-01 10:00:00',
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <PostListPage />
      </ToastProvider>
    </MemoryRouter>,
  );

describe('PostListPage 分享功能', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recordPostShareMock.mockResolvedValue(undefined);
    getPostListMock.mockResolvedValue({ list: [basePost], total: 1 });
    // jsdom 无剪贴板 API，stub 掉避免走 execCommand 降级分支
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('点击列表卡片分享按钮打开分享面板（与详情页一致），而不是直接上报', async () => {
    renderPage();

    const shareBtn = await screen.findByRole('button', { name: '分享' });
    fireEvent.click(shareBtn);

    // 分享面板出现：平台入口 + 二维码页签
    expect(await screen.findByText('分享方式')).toBeInTheDocument();
    expect(screen.getAllByText('二维码').length).toBeGreaterThan(0);
    expect(screen.getByText('复制链接')).toBeInTheDocument();

    // 仅打开面板，尚未选择平台 => 不应上报分享
    expect(recordPostShareMock).not.toHaveBeenCalled();
  });

  it('在面板中选择「复制链接」后才上报分享并带上 platform', async () => {
    renderPage();

    const shareBtn = await screen.findByRole('button', { name: '分享' });
    fireEvent.click(shareBtn);
    await screen.findByText('分享方式');

    const copyEntry = screen.getByText('复制链接').closest('button');
    expect(copyEntry).not.toBeNull();
    fireEvent.click(copyEntry as HTMLElement);

    await waitFor(() => {
      expect(recordPostShareMock).toHaveBeenCalledWith(basePost.id, { platform: 'link' });
    });
  });
});
