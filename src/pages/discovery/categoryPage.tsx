import { Link } from 'react-router-dom';
import { useCategory } from '../../hooks/useCategory';
import { PetIcon, PostIcon } from '../../components/discovery/filterIcons';
import { CategoryIcon } from '../../components/discovery/categoryIcon';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { Heart, MessageCircle, Share2, ArrowLeft, Play, Image } from 'lucide-react';
import { Avatar } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { FilterChip } from '../../components/ui/filterChip';
import { Skeleton } from '../../components/ui/skeleton';
import { Spinner } from '../../components/ui/spinner';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import './categoryPage.scss';

const LikeIcon = ({ active, size = ICON_SIZE.action }: { active?: boolean; size?: number }) => (
  <Heart size={size} strokeWidth={iconStroke(size)} fill={active ? 'currentColor' : 'none'} aria-hidden="true" />
);

const CommentIcon = ({ size = ICON_SIZE.action }: { size?: number }) => (
  <MessageCircle size={size} strokeWidth={iconStroke(size)} aria-hidden="true" />
);

const ShareIcon = ({ size = ICON_SIZE.action }: { size?: number }) => (
  <Share2 size={size} strokeWidth={iconStroke(size)} aria-hidden="true" />
);

const ArrowLeftIcon = ({ size = ICON_SIZE.nav }: { size?: number }) => (
  <ArrowLeft size={size} strokeWidth={iconStroke(size)} aria-hidden="true" />
);

const PlayIcon = () => (
  <Play size={ICON_SIZE.feature} fill="white" stroke="none" aria-hidden="true" />
);

const ImageIcon = ({ size = ICON_SIZE.feature }: { size?: number }) => (
  <Image size={size} strokeWidth={iconStroke(size)} aria-hidden="true" />
);

export const CategoryPage = () => {
  const {
    categoryInfo,
    loading,
    posts,
    total,
    page,
    setPage,
    petType,
    setPetType,
    postType,
    setPostType,
    sortType,
    setSortType,
  } = useCategory();

  const totalPages = Math.ceil(total / 10);

  const petTypes = [
    { value: '', label: '全部' },
    { value: 'dog', label: '狗狗', icon: 'dog' },
    { value: 'cat', label: '猫咪', icon: 'cat' },
    { value: 'bird', label: '鸟类', icon: 'bird' },
    { value: 'fish', label: '鱼类', icon: 'fish' },
    { value: 'other', label: '其他', icon: 'other' },
  ];

  const postTypes = [
    { value: '', label: '全部' },
    { value: 'image', label: '图文', icon: 'image' },
    { value: 'video', label: '视频', icon: 'video' },
    { value: 'text', label: '文字', icon: 'text' },
  ];

  const formatCount = (count: number) => {
    if (count >= 10000) return `${(count / 10000).toFixed(1)}万`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return String(count);
  };

  return (
    <div className="category-page">
      {/* 渐变头部 */}
      <div className="category-hero">
        <div className="hero-decor hero-decor-1" />
        <div className="hero-decor hero-decor-2" />
        <div className="hero-back">
          <Link to="/discover">
            <ArrowLeftIcon />
          </Link>
        </div>
        <div className="hero-content">
          {categoryInfo ? (
            <>
              <div className="hero-icon-wrap">
                <CategoryIcon categoryName={categoryInfo.name} size={ICON_SIZE.feature} color="currentColor" />
              </div>
              <h1 className="hero-title">{categoryInfo.name}</h1>
              <p className="hero-desc">{categoryInfo.description}</p>
            </>
          ) : (
            <>
              <div className="hero-icon-wrap hero-icon-default">
                <ImageIcon />
              </div>
              <h1 className="hero-title">分类浏览</h1>
              <p className="hero-desc">发现感兴趣的宠物内容</p>
            </>
          )}
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="filter-bar">
        <div className="filter-row">
          <span className="filter-label">宠物</span>
          <div className="filter-chips">
            {petTypes.map((pt) => (
              <FilterChip
                key={pt.value}
                active={petType === pt.value}
                onClick={() => setPetType(pt.value)}
                className="filter-chip"
              >
                {pt.icon && <PetIcon type={pt.icon} />}
                <span>{pt.label}</span>
              </FilterChip>
            ))}
          </div>
        </div>
        <div className="filter-row">
          <span className="filter-label">类型</span>
          <div className="filter-chips">
            {postTypes.map((pt) => (
              <FilterChip
                key={pt.value}
                active={postType === pt.value}
                onClick={() => setPostType(pt.value)}
                className="filter-chip"
              >
                {pt.icon && <PostIcon type={pt.icon} />}
                <span>{pt.label}</span>
              </FilterChip>
            ))}
          </div>
        </div>
        <div className="filter-row sort-row">
          <div className="sort-tabs flex gap-2">
            <FilterChip
              tone="secondary"
              active={sortType === 'latest'}
              onClick={() => setSortType('latest')}
              className="sort-tab"
            >
              最新
            </FilterChip>
            <FilterChip
              tone="secondary"
              active={sortType === 'hot'}
              onClick={() => setSortType('hot')}
              className="sort-tab"
            >
              最热
            </FilterChip>
          </div>
          <span className="result-count">共 {total} 条</span>
        </div>
      </div>

      {/* 帖子列表 */}
      <div className="posts-list">
        {loading && posts.length === 0 && (
          <div className="space-y-4 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="post-card">
                <div className="post-user flex gap-3 mb-3">
                  <Skeleton circle className="post-avatar w-10 h-10" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
            <div className="flex justify-center py-2">
              <Spinner size="sm" label="加载中..." />
            </div>
          </div>
        )}
        {!loading && posts.length === 0 && (
          <div className="empty-state">
            <svg
              width={ICON_SIZE.empty}
              height={ICON_SIZE.empty}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>暂无相关内容</span>
            <p className="empty-hint">换个筛选条件试试吧</p>
          </div>
        )}
        {posts.map((post) => (
          <Link key={post.id} to={`/posts/${post.id}`} className="post-card">
            <div className="post-user">
              <Avatar src={post.userAvatar || getDefaultUserAvatar()} name={post.userNickname} className="post-avatar" />
              <div className="post-user-info">
                <span className="post-nickname">{post.userNickname}</span>
                <span className="post-time">{post.createdAt}</span>
              </div>
            </div>
            {post.content && <div className="post-content">{post.content}</div>}
            {post.images && post.images.length > 0 && (
              <div className={`post-images grid-${Math.min(post.images.length, 3)}`}>
                {post.images.slice(0, 9).map((img, idx) => (
                  <div key={idx} className="post-image">
                    <img src={img} alt="" />
                    {post.images!.length > 9 && idx === 8 && (
                      <div className="image-more">+{post.images!.length - 9}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {post.video && (
              <div className="post-video">
                <video src={post.video} controls={false} poster="" />
                <div className="play-overlay">
                  <PlayIcon />
                </div>
              </div>
            )}
            <div className="post-actions">
              <span className={`action-item like-action ${post.isLiked ? 'liked' : ''}`}>
                <LikeIcon active={post.isLiked} />
                <span>{formatCount(post.likesCount)}</span>
              </span>
              <span className="action-item">
                <CommentIcon />
                <span>{formatCount(post.commentsCount)}</span>
              </span>
              <span className="action-item">
                <ShareIcon />
                <span>{formatCount(post.sharesCount)}</span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="pagination">
          <Button
            type="button"
            variant="outline"
            className="page-btn prev-btn"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            上一页
          </Button>
          <div className="page-indicator">
            <span className="page-current">{page}</span>
            <span className="page-separator">/</span>
            <span className="page-total">{totalPages}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            className="page-btn next-btn"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
};
