import React from 'react';
import { PostInfo } from '../../types/post';
import { usePostActions } from '../../hooks/usePostActions';
import { Button } from '../ui/button';

/**
 * 帖子四按钮：点赞 / 评论 / 收藏 / 分享
 * - compact=true：用于 postListPage 首页列表（小而密）
 * - compact=false：用于 postDetailPage 详情（稍大，预留文案空间）
 */
export interface PostActionsProps {
  post: PostInfo;
  compact?: boolean;
  className?: string;
  /** 可选：在详情页覆盖某行为，例如详情评论本来就跳锚点不需要 navigate */
  onCommentOverride?: () => void;
}

const HeartIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CommentIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const BookmarkIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const ShareIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
  </svg>
);

export const PostActions: React.FC<PostActionsProps> = ({ post, compact = false, className, onCommentOverride }) => {
  const { state, onLike, onFavorite, onShare, onComment } = usePostActions(post);

  const itemClass = [
    'action-item',
    'min-w-0 h-auto p-0 bg-transparent shadow-none',
    compact ? 'text-sm' : 'text-base',
  ].join(' ');

  return (
    <div className={`post-actions flex items-center gap-5 text-brown-light ${compact ? 'text-sm py-2' : 'text-base py-3'} ${className ?? ''}`}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="点赞"
        className={`${itemClass} ${state.isLiked ? 'text-error' : ''}`}
        onClick={onLike}
      >
        <HeartIcon filled={state.isLiked} />
        <span className="tabular-nums">{state.likesCount}</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="评论"
        className={itemClass}
        onClick={onCommentOverride ?? onComment}
      >
        <CommentIcon />
        <span className="tabular-nums">{state.commentsCount}</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="收藏"
        className={`${itemClass} ${state.isFavorited ? 'text-amber-500' : ''}`}
        onClick={onFavorite}
      >
        <BookmarkIcon filled={state.isFavorited} />
        <span className="tabular-nums">{state.favoritesCount}</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="分享"
        className={itemClass}
        onClick={() => onShare('copy')}
      >
        <ShareIcon />
        <span className="tabular-nums">{state.sharesCount}</span>
      </Button>
    </div>
  );
};

export default PostActions;
