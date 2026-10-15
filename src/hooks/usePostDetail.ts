import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPostDetail,
  togglePostLike,
  togglePostFavorite,
  recordPostShare,
  deletePost,
  createReport,
} from '../api/post';
import { useToast } from '../components/toast';
import { useUserStore } from '../stores/userStore';
import { PostInfo, ReportCreateRequest, LikeResult, FavoriteResult } from '../types/post';

/**
 * 动态详情页 hook
 *
 * 封装动态详情的加载、点赞/收藏/分享/删除/举报等操作。
 * 内部维护 post 状态,所有操作均同步更新 post,避免 UI 与数据脱节。
 *
 * 用法:
 *   const { post, loading, refetch, onLike, onFavorite, onShare, onDelete, onReport } = usePostDetail(id);
 */
export function usePostDetail(id?: string | number) {
  const navigate = useNavigate();
  const { isLoggedIn } = useUserStore();
  const toast = useToast();

  const [post, setPost] = useState<PostInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const postId = id !== undefined ? Number(id) : 0;

  const refetch = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const res = await getPostDetail(postId);
      setPost(res);
    } catch (e: unknown) {
      toast.error((e as Error).message || '加载失败');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [postId, toast, navigate]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const requireLogin = useCallback((): boolean => {
    if (!isLoggedIn) {
      navigate('/login');
      return false;
    }
    return true;
  }, [isLoggedIn, navigate]);

  const onLike = useCallback(async () => {
    if (!requireLogin() || !post) return;
    const prevLiked = post.isLiked;
    // 乐观更新
    setPost({
      ...post,
      isLiked: !post.isLiked,
      likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
    });
    try {
      const res: LikeResult = await togglePostLike(post.id);
      setPost((p) => (p ? { ...p, isLiked: res.liked, likesCount: res.likesCount } : p));
      toast.success(res.liked ? '点赞成功' : '已取消点赞');
    } catch (e: unknown) {
      // 回滚
      setPost((p) => (p ? {
        ...p,
        isLiked: prevLiked,
        likesCount: prevLiked ? p.likesCount + 1 : p.likesCount - 1,
      } : p));
      toast.error((e as Error).message || '操作失败');
    }
  }, [post, requireLogin, toast]);

  const onFavorite = useCallback(async () => {
    if (!requireLogin() || !post) return;
    const prevFavorited = post.isFavorited;
    setPost({
      ...post,
      isFavorited: !post.isFavorited,
      favoritesCount: post.isFavorited ? post.favoritesCount - 1 : post.favoritesCount + 1,
    });
    try {
      const res: FavoriteResult = await togglePostFavorite(post.id);
      setPost((p) => (p ? {
        ...p,
        isFavorited: res.favorited,
        favoritesCount: res.favoritesCount,
      } : p));
      toast.success(res.favorited ? '已收藏' : '已取消收藏');
    } catch (e: unknown) {
      setPost((p) => (p ? {
        ...p,
        isFavorited: prevFavorited,
        favoritesCount: prevFavorited ? p.favoritesCount + 1 : p.favoritesCount - 1,
      } : p));
      toast.error((e as Error).message || '操作失败');
    }
  }, [post, requireLogin, toast]);

  const onShare = useCallback(async (platform: string) => {
    if (!post) return;
    setPost({ ...post, sharesCount: post.sharesCount + 1 });
    try {
      await recordPostShare(post.id, { platform });
      toast.success('分享成功');
    } catch (e: unknown) {
      setPost((p) => (p ? { ...p, sharesCount: Math.max(0, p.sharesCount - 1) } : p));
      toast.error((e as Error).message || '分享失败');
    }
  }, [post, toast]);

  const onDelete = useCallback(async () => {
    if (!post) return false;
    try {
      await deletePost(post.id);
      toast.success('删除成功');
      navigate(-1);
      return true;
    } catch (e: unknown) {
      toast.error((e as Error).message || '删除失败');
      return false;
    }
  }, [post, toast, navigate]);

  const onReport = useCallback(async (req: ReportCreateRequest) => {
    if (!post) return false;
    try {
      await createReport({ ...req, targetType: 'post', targetId: post.id });
      toast.success('举报已提交');
      return true;
    } catch (e: unknown) {
      toast.error((e as Error).message || '举报失败');
      return false;
    }
  }, [post, toast]);

  return {
    post,
    loading,
    refetch,
    setPost,
    onLike,
    onFavorite,
    onShare,
    onDelete,
    onReport,
  };
}
