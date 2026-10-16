import React from 'react';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { PostInfo } from '../../types/post';
import { usePostActions } from '../../hooks/usePostActions';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { Button } from '../ui/button';

/**
 * 帖子四按钮：点赞 / 评论 / 收藏 / 分享
 * - compact=true：列表卡（ICON_SIZE.action）
 * - compact=false：详情正文内联（同档 action，间距略大）
 */
export interface PostActionsProps {
  post: PostInfo;
  compact?: boolean;
  className?: string;
  /** 详情页：聚焦评论区，不 navigate */
  onCommentOverride?: () => void;
  /** 详情页：打开分享面板等 */
  onShareOverride?: () => void;
  /** 详情页：复用 usePostDetail 的点赞（展示以 post 为准） */
  onLikeOverride?: () => void;
  /** 详情页：复用 usePostDetail 的收藏（展示以 post 为准） */
  onFavoriteOverride?: () => void;
}

export const PostActions: React.FC<PostActionsProps> = ({
  post,
  compact = false,
  className,
  onCommentOverride,
  onShareOverride,
  onLikeOverride,
  onFavoriteOverride,
}) => {
  const { state, onLike, onFavorite, onShare, onComment } = usePostActions(post);

  // 详情页传入 override 时以 post 为准，避免与 usePostDetail 双份状态
  const isLiked = onLikeOverride ? !!post.isLiked : state.isLiked;
  const likesCount = onLikeOverride ? post.likesCount : state.likesCount;
  const isFavorited = onFavoriteOverride ? !!post.isFavorited : state.isFavorited;
  const favoritesCount = onFavoriteOverride ? post.favoritesCount : state.favoritesCount;
  const commentsCount = onCommentOverride ? post.commentsCount : state.commentsCount;
  const sharesCount = onShareOverride ? post.sharesCount : state.sharesCount;

  const iconPx = ICON_SIZE.action;
  const stroke = iconStroke(iconPx);

  const itemClass = [
    'action-item',
    'inline-flex items-center gap-1.5 min-w-0 h-auto min-h-11 px-1 py-1 bg-transparent shadow-none',
    compact ? 'text-sm' : 'text-base',
  ].join(' ');

  return (
    <div
      className={`post-actions flex items-center ${compact ? 'justify-around gap-2 text-sm py-2' : 'gap-6 text-base py-3'} text-brown-secondary ${className ?? ''}`}
      role="group"
      aria-label="动态操作"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="点赞"
        aria-pressed={isLiked}
        className={`${itemClass} ${isLiked ? 'text-primary' : ''}`}
        onClick={onLikeOverride ?? onLike}
      >
        <Heart
          size={iconPx}
          strokeWidth={stroke}
          fill={isLiked ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
        <span className="tabular-nums">{likesCount}</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="评论"
        className={itemClass}
        onClick={onCommentOverride ?? onComment}
      >
        <MessageCircle size={iconPx} strokeWidth={stroke} aria-hidden="true" />
        <span className="tabular-nums">{commentsCount}</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="收藏"
        aria-pressed={isFavorited}
        className={`${itemClass} ${isFavorited ? 'text-primary' : ''}`}
        onClick={onFavoriteOverride ?? onFavorite}
      >
        <Bookmark
          size={iconPx}
          strokeWidth={stroke}
          fill={isFavorited ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
        <span className="tabular-nums">{favoritesCount}</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="分享"
        className={itemClass}
        onClick={onShareOverride ?? (() => onShare('copy'))}
      >
        <Share2 size={iconPx} strokeWidth={stroke} aria-hidden="true" />
        <span className="tabular-nums">{sharesCount}</span>
      </Button>
    </div>
  );
};

export default PostActions;
