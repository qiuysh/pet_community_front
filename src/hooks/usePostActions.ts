import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { togglePostLike, togglePostFavorite, recordPostShare } from '../api/post';
import { useToast } from '../components/toast';
import { FavoriteResult, LikeResult, PostInfo } from '../types/post';
import { useUserStore } from '../stores/userStore';

/**
 * 帖子列表 / 详情通用的四按钮交互 hook
 * 返回一个可在 <PostActions /> 中消费的 action 对象
 * 约定：失败回滚乐观更新（like/favorite/share count）
 */
export interface PostActionsState {
  likesCount: number;
  commentsCount: number;
  favoritesCount: number;
  sharesCount: number;
  isLiked: boolean;
  isFavorited: boolean;
}

export function usePostActions(post: PostInfo) {
  const { isLoggedIn } = useUserStore();
  const toast = useToast();
  const navigate = useNavigate();

  const [state, setState] = useState<PostActionsState>(() => ({
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    favoritesCount: post.favoritesCount,
    sharesCount: post.sharesCount,
    isLiked: !!post.isLiked,
    isFavorited: !!post.isFavorited,
  }));

  const requireLogin = useCallback(
    (): boolean => {
      if (!isLoggedIn) {
        navigate('/login');
        return false;
      }
      return true;
    },
    [isLoggedIn, navigate],
  );

  const onLike = useCallback(async () => {
    if (!requireLogin()) return;
    const prev = state.isLiked;
    setState((s) => ({
      ...s,
      isLiked: !s.isLiked,
      likesCount: s.isLiked ? s.likesCount - 1 : s.likesCount + 1,
    }));
    try {
      const res: LikeResult = await togglePostLike(post.id);
      setState((s) => ({ ...s, isLiked: res.liked, likesCount: res.likesCount }));
      toast.success(res.liked ? '点赞成功' : '已取消点赞');
    } catch (e) {
      // 失败回滚
      setState((s) => ({
        ...s,
        isLiked: prev,
        likesCount: prev ? s.likesCount + 1 : s.likesCount - 1,
      }));
      toast.error((e as Error).message || '点赞失败');
    }
  }, [state.isLiked, post.id, requireLogin]);

  const onFavorite = useCallback(async () => {
    if (!requireLogin()) return;
    const prev = state.isFavorited;
    setState((s) => ({
      ...s,
      isFavorited: !s.isFavorited,
      favoritesCount: s.isFavorited ? s.favoritesCount - 1 : s.favoritesCount + 1,
    }));
    try {
      const res: FavoriteResult = await togglePostFavorite(post.id);
      setState((s) => ({
        ...s,
        isFavorited: res.favorited,
        favoritesCount: res.favoritesCount,
      }));
      toast.success(res.favorited ? '已收藏' : '已取消收藏');
    } catch (e) {
      setState((s) => ({
        ...s,
        isFavorited: prev,
        favoritesCount: prev ? s.favoritesCount + 1 : s.favoritesCount - 1,
      }));
      toast.error((e as Error).message || '收藏失败');
    }
  }, [state.isFavorited, post.id, requireLogin]);

  const onShare = useCallback(async (platform = 'copy') => {
    setState((s) => ({ ...s, sharesCount: s.sharesCount + 1 }));
    try {
      await recordPostShare(post.id, { platform });
      toast.success('分享成功');
    } catch (e) {
      setState((s) => ({ ...s, sharesCount: Math.max(0, s.sharesCount - 1) }));
      toast.error((e as Error).message || '分享失败');
    }
  }, [post.id]);

  // 评论：跳转到详情页评论锚点
  const onComment = useCallback(() => {
    navigate(`/posts/${post.id}`, { state: { scrollToComments: true } });
  }, [post.id, navigate]);

  return { state, onLike, onFavorite, onShare, onComment };
}
