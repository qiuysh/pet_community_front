import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPostComments,
  createComment,
  toggleCommentLike,
} from '../api/post';
import { useToast } from '../components/toast';
import { useUserStore } from '../stores/userStore';
import {
  CommentInfo,
  CommentListParams,
  CommentCreateRequest,
  LikeResult,
} from '../types/post';

/**
 * 动态评论 hook
 *
 * 封装评论列表加载、发表评论、点赞评论、回复评论等操作。
 * 内部维护 comments 状态,新增评论插入到列表头部,回复插入到对应父评论 children。
 *
 * 用法:
 *   const { comments, loading, refetch, addComment, toggleLike, replyTarget, setReplyTarget } = usePostComments(postId);
 */
export interface ReplyTarget {
  id: number;
  name: string;
  parentId: number;
}

export function usePostComments(postId: number, commentsCount?: number) {
  const navigate = useNavigate();
  const { isLoggedIn } = useUserStore();
  const toast = useToast();

  const [comments, setComments] = useState<CommentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [totalCount, setTotalCount] = useState<number>(commentsCount ?? 0);

  const fetchParams: CommentListParams = {
    postId,
    page: 1,
    pageSize: 20,
    sort: 'latest',
  };

  const refetch = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const res = await getPostComments(fetchParams);
      setComments(res.list);
      setTotalCount(res.total);
    } catch (e) {
      console.error('加载评论失败', e);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const requireLogin = useCallback((): boolean => {
    if (!isLoggedIn) {
      navigate('/login');
      return false;
    }
    return true;
  }, [isLoggedIn, navigate]);

  const addComment = useCallback(
    async (content: string, reply?: ReplyTarget | null): Promise<boolean> => {
      if (!requireLogin() || !content.trim() || !postId) return false;

      const req: CommentCreateRequest = {
        postId,
        content: content.trim(),
        parentId: reply?.parentId || 0,
        replyToId: reply?.id,
      };

      try {
        const res = await createComment(req);
        if (res.parentId === 0) {
          setComments((prev) => [res, ...prev]);
        } else {
          setComments((prev) => prev.map((c) => {
            if (c.id === res.parentId) {
              return { ...c, children: [...(c.children || []), res] };
            }
            return c;
          }));
        }
        setTotalCount((c) => c + 1);
        setReplyTarget(null);
        toast.success('评论成功');
        return true;
      } catch (e: unknown) {
        toast.error((e as Error).message || '评论失败');
        return false;
      }
    },
    [postId, requireLogin, toast],
  );

  const toggleLike = useCallback(
    async (commentId: number) => {
      if (!requireLogin()) return;
      try {
        const res: LikeResult = await toggleCommentLike(commentId);
        const updateList = (list: CommentInfo[]): CommentInfo[] =>
          list.map((c) => {
            if (c.id === commentId) {
              return { ...c, isLiked: res.liked, likesCount: res.likesCount };
            }
            if (c.children) {
              return { ...c, children: updateList(c.children) };
            }
            return c;
          });
        setComments((prev) => updateList(prev));
      } catch (e: unknown) {
        toast.error((e as Error).message || '操作失败');
      }
    },
    [requireLogin, toast],
  );

  const startReply = useCallback(
    (comment: CommentInfo) => {
      if (!requireLogin()) return;
      const parentId = comment.parentId || comment.id;
      setReplyTarget({
        id: comment.userId,
        name: comment.userNickname,
        parentId,
      });
    },
    [requireLogin],
  );

  const cancelReply = useCallback(() => {
    setReplyTarget(null);
  }, []);

  return {
    comments,
    loading,
    totalCount,
    replyTarget,
    refetch,
    addComment,
    toggleLike,
    startReply,
    cancelReply,
  };
}
