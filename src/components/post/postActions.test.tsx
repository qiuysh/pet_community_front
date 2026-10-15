import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { PostActions } from './postActions';
import { PostInfo } from '../../types/post';
import { ToastProvider } from '../toast';

vi.mock('react-router-dom', async (importOriginal) => {
  const real = await importOriginal<typeof import('react-router-dom')>();
  return { ...real, useNavigate: vi.fn(() => vi.fn()) };
});

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
  status: 1, // 已发布
  createdAt: '2024-01-01 10:00:00',
};

const renderWith = (ui: React.ReactNode) => {
  return render(
    <MemoryRouter>
      <ToastProvider>{ui}</ToastProvider>
    </MemoryRouter>
  );
};

describe('PostActions 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染 4 个计数（点赞/评论/收藏/分享）', () => {
    renderWith(<PostActions post={basePost} />);
    expect(screen.getByText('3')).toBeInTheDocument(); // likes
    expect(screen.getByText('5')).toBeInTheDocument(); // comments
    expect(screen.getByText('1')).toBeInTheDocument(); // favorites
    expect(screen.getByText('0')).toBeInTheDocument(); // shares
  });

  it('点击评论按钮会跳转到帖子详情', async () => {
    const mockNavigate = vi.fn();
    (useNavigate as any).mockReturnValue(mockNavigate);
    renderWith(<PostActions post={basePost} />);
    fireEvent.click(screen.getByRole('button', { name: /评论/ }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
      expect(mockNavigate.mock.calls[0][0]).toBe(`/posts/${basePost.id}`);
    });
  });

  it('compact 模式下只渲染图标与数字（无 tooltip 文案）', () => {
    const { container } = renderWith(<PostActions post={basePost} compact />);
    // 不使用 aria-label 文案匹配的完整列表；只要能找到 4 个计数就算渲染成功
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(container.querySelectorAll('.action-item').length).toBeGreaterThanOrEqual(4);
  });

  it('详情页 override：评论/分享走外部回调且不 navigate', async () => {
    const mockNavigate = vi.fn();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
    const onComment = vi.fn();
    const onShare = vi.fn();
    renderWith(
      <PostActions
        post={basePost}
        onCommentOverride={onComment}
        onShareOverride={onShare}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /评论/ }));
    fireEvent.click(screen.getByRole('button', { name: /分享/ }));
    await waitFor(() => {
      expect(onComment).toHaveBeenCalled();
      expect(onShare).toHaveBeenCalled();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
