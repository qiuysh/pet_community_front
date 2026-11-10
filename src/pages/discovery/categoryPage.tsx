import { Link } from 'react-router-dom';
import { useCategory } from '../../hooks/useCategory';
import { PetIcon, PostIcon } from '../../components/discovery/filterIcons';
import { CategoryIcon } from '../../components/discovery/categoryIcon';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { ArrowLeft, Inbox, LayoutGrid, Play } from 'lucide-react';
import { Avatar } from '../../components/ui/avatar';
import { EmptyState } from '../../components/ui/emptyState';
import { FilterChip } from '../../components/ui/filterChip';
import { Pagination } from '../../components/ui/pagination';
import { Skeleton } from '../../components/ui/skeleton';
import { Spinner } from '../../components/ui/spinner';
import { PostActions } from '../../components/post/postActions';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import type { PostInfo } from '../../types/post';
import type { RecommendPostInfo } from '../../types/discovery';
import './categoryPage.scss';

const ArrowLeftIcon = ({ size = ICON_SIZE.nav }: { size?: number }) => (
  <ArrowLeft size={size} strokeWidth={iconStroke(size)} aria-hidden="true" />
);

const PlayIcon = () => (
  <Play size={ICON_SIZE.feature} fill="white" stroke="none" aria-hidden="true" />
);

const FallbackHeroIcon = ({ size = ICON_SIZE.feature }: { size?: number }) => (
  <LayoutGrid size={size} strokeWidth={iconStroke(size)} aria-hidden="true" />
);

/**
 * 分类卡的帖子模型缺少收藏/可见性/状态字段，补默认值后复用 PostActions，
 * 保证点赞/评论/分享与首页、详情页行为一致。
 */
const toPostInfo = (post: RecommendPostInfo): PostInfo => ({
  ...post,
  favoritesCount: 0,
  visibility: 0,
  status: 1,
});

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
              <h1 className="page-content-title hero-title">{categoryInfo.name}</h1>
              <p className="hero-desc">{categoryInfo.description}</p>
            </>
          ) : (
            <>
              <div className="hero-icon-wrap hero-icon-default">
                <FallbackHeroIcon />
              </div>
              <h1 className="page-content-title hero-title">分类浏览</h1>
              <p className="hero-desc">按兴趣逛逛猫狗与更多宠友内容</p>
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
      <div className="posts-list motion-list">
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
              <Spinner size="sm" label="加载中…" />
            </div>
          </div>
        )}
        {!loading && posts.length === 0 && (
          <EmptyState
            icon={<Inbox size={ICON_SIZE.empty} strokeWidth={iconStroke(ICON_SIZE.empty)} className="opacity-30" />}
            title="暂无相关内容"
            description="换个筛选条件试试吧"
          />
        )}
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            {/* 拉伸链接：卡片空白处点击进入详情；操作按钮浮在其上 */}
            <Link
              to={`/posts/${post.id}`}
              className="stretched-link"
              aria-label={`查看 ${post.userNickname} 的动态详情`}
            />
            <div className="post-user">
              <Avatar src={post.userAvatar || getDefaultUserAvatar()} name={post.userNickname} className="post-avatar" />
              <div className="post-user-info">
                <span className="page-section-title post-nickname">{post.userNickname}</span>
                <span className="post-time">{post.createdAt}</span>
              </div>
            </div>
            {post.content && <div className="post-content">{post.content}</div>}
            {post.images && post.images.length > 0 && (
              <div className={`post-images grid-${Math.min(post.images.length, 3)}`}>
                {post.images.slice(0, 9).map((img, idx) => (
                  <div key={idx} className="post-image">
                    <img src={img} alt="" decoding="async" />
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
            <PostActions
              post={toPostInfo(post)}
              compact
              items={['like', 'comment', 'share']}
              className="post-card-actions"
            />
          </div>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};
