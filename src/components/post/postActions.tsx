import React, { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { PostInfo } from '../../types/post';
import { usePostActions } from '../../hooks/usePostActions';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { formatCount } from '../../utils/format';
import { Button } from '../ui/button';
import { ShareSheet } from './shareSheet';

/**
 * 帖子四按钮：点赞 / 评论 / 收藏 / 分享
 * - compact=true：列表卡（ICON_SIZE.action）
 * - compact=false：详情正文内联（同档 action，间距略大）
 *
 * 分享行为与详情页保持一致：点击分享打开分享面板（微信/微博/复制链接/二维码），
 * 选择平台后再上报分享数。传入 onShareOverride 时由外部接管（详情页复用自身 state）。
 */

/** 可展示的操作按钮，默认全展示 */
export type PostActionKey = 'like' | 'comment' | 'favorite' | 'share';

const DEFAULT_ITEMS: PostActionKey[] = ['like', 'comment', 'favorite', 'share'];

export interface PostActionsProps {
  post: PostInfo;
  compact?: boolean;
  className?: string;
  /** 展示哪些按钮；摘要卡（如分类页）可只保留 like/comment/share */
  items?: PostActionKey[];
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
  items = DEFAULT_ITEMS,
  onCommentOverride,
  onShareOverride,
  onLikeOverride,
  onFavoriteOverride,
}) => {
  const { state, onLike, onFavorite, onShare, onComment } = usePostActions(post);
  const [shareOpen, setShareOpen] = useState(false);

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
    <>
      <div
        className={`post-actions flex items-center ${compact ? 'justify-around gap-2 text-sm py-2' : 'gap-6 text-base py-3'} text-brown-secondary ${className ?? ''}`}
        role="group"
        aria-label="动态操作"
      >
        {items.includes('like') && (
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
            <span className="tabular-nums">{formatCount(likesCount)}</span>
          </Button>
        )}

        {items.includes('comment') && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="评论"
            className={itemClass}
            onClick={onCommentOverride ?? onComment}
          >
            <MessageCircle size={iconPx} strokeWidth={stroke} aria-hidden="true" />
            <span className="tabular-nums">{formatCount(commentsCount)}</span>
          </Button>
        )}

        {items.includes('favorite') && (
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
            <span className="tabular-nums">{formatCount(favoritesCount)}</span>
          </Button>
        )}

        {items.includes('share') && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="分享"
            className={itemClass}
            onClick={onShareOverride ?? (() => setShareOpen(true))}
          >
            <Share2 size={iconPx} strokeWidth={stroke} aria-hidden="true" />
            <span className="tabular-nums">{formatCount(sharesCount)}</span>
          </Button>
        )}
      </div>

      {/* 默认（列表场景）自带分享面板，与详情页保持一致；override 时由外部渲染 */}
      {!onShareOverride && (
        <ShareSheet
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          postUrl={`${window.location.origin}/posts/${post.id}`}
          postTitle={post.content}
          onShare={(platform) => void onShare(platform)}
        />
      )}
    </>
  );
};

export default PostActions;
