import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTopicDetail } from '../../hooks/useTopicDetail';
import { useUserStore } from '../../stores/userStore';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { AdBanner } from '../../components/ad/AdBanner';
import { ShareSheet } from '../../components/post/shareSheet';
import { Heart, MessageCircle, Share2, UserPlus, UserCheck } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { Avatar } from '../../components/ui/avatar';
import { Button, buttonClass } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { EmptyState } from '../../components/ui/emptyState';
import { PageHeader } from '../../components/ui/pageHeader';
import { Pagination } from '../../components/ui/pagination';
import { Skeleton } from '../../components/ui/skeleton';
import { Spinner } from '../../components/ui/spinner';
import { formatRelativeTime } from '../../utils/format';
import './topicDetailPage.scss';

export const TopicDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useUserStore();
  const {
    topic,
    loadingTopic,
    posts,
    loadingPosts,
    totalPages,
    page,
    setPage,
    participating,
    toggleParticipate,
    shareOpen,
    shareUrl,
    openShare,
    closeShare,
    onShare,
  } = useTopicDetail(id);

  const requireLogin = (nextPath: string) => {
    navigate('/login', { state: { from: nextPath } });
  };

  if (loadingTopic) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Spinner label="加载中…" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="bg-cream min-h-screen">
        <PageHeader title="话题详情" fallbackTo="/topics" />
        <div className="page-shell">
          <EmptyState
            title="话题不存在或已下架"
            description="回话题库看看其他话题吧"
            action={
              <Link to="/topics" className={buttonClass({ variant: 'outline' })}>
                去话题库
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="topic-detail-page">
      <PageHeader title="话题详情" fallbackTo="/topics" />

      <div className="topic-detail-body">
        <Card padding="none" className="topic-info-card">
          <div className="topic-cover">
            {topic.cover ? (
              <img
                src={topic.cover}
                alt={topic.name}
                width={1120}
                height={420}
                decoding="async"
              />
            ) : (
              <div className="cover-placeholder" aria-hidden="true">#</div>
            )}
          </div>
          <div className="topic-meta">
            <h2 className="page-content-title topic-name">{topic.name}</h2>
            <p className="topic-desc">{topic.description || '暂无描述'}</p>
            <div className="topic-stats">
              <span className="tabular-nums">{topic.postsCount} 条动态</span>
              <span className="tabular-nums">{topic.participantsCount} 人参与</span>
            </div>
            <div className="topic-actions flex flex-wrap gap-2 mt-3">
              <Button
                type="button"
                size="sm"
                variant={topic.isParticipated ? 'outline' : 'primary'}
                disabled={participating}
                onClick={() => void toggleParticipate()}
              >
                {topic.isParticipated ? (
                  <>
                    <UserCheck size={ICON_SIZE.inline} aria-hidden="true" />
                    已参与
                  </>
                ) : (
                  <>
                    <UserPlus size={ICON_SIZE.inline} aria-hidden="true" />
                    {isLoggedIn ? '参与话题' : '登录后参与'}
                  </>
                )}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={openShare}>
                <Share2 size={ICON_SIZE.inline} aria-hidden="true" />
                分享{topic.sharesCount > 0 ? ` ${topic.sharesCount}` : ''}
              </Button>
              {isLoggedIn ? (
                <Link
                  to={`/posts/create?topicId=${topic.id}`}
                  className={buttonClass({ size: 'sm', variant: 'ghost' })}
                >
                  发动态
                </Link>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => requireLogin(`/posts/create?topicId=${topic.id}`)}
                >
                  登录后发动态
                </Button>
              )}
            </div>
          </div>
        </Card>

        <AdBanner location="topic_banner" className="topic-banner-slot" />

        <div className="posts-section">
          <h3 className="page-section-title section-title">相关动态</h3>

          <div className="posts-list">
            {loadingPosts && posts.length === 0 && (
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i} padding="md" className="post-card mb-3">
                    <div className="post-header flex gap-3 mb-3">
                      <Skeleton circle className="avatar w-10 h-10" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </Card>
                ))}
              </>
            )}
            {!loadingPosts && posts.length === 0 && <EmptyState title="暂无相关动态" />}

            {posts.map((post) => (
              <Link key={post.id} to={`/posts/${post.id}`} className="post-card">
                <div className="post-header">
                  <Avatar src={post.userAvatar || getDefaultUserAvatar()} name={post.userNickname} className="avatar" />
                  <div className="user-info">
                    <div className="page-section-title nickname">{post.userNickname}</div>
                    <div className="time">{formatRelativeTime(post.createdAt)}</div>
                  </div>
                </div>
                {post.content && <div className="post-content">{post.content}</div>}
                {post.images && post.images.length > 0 && (
                  <div className={`post-images grid-${Math.min(post.images.length, 3)}`}>
                    {post.images.slice(0, 9).map((img, idx) => (
                      <div key={idx} className="post-image">
                        <img
                          src={img}
                          alt=""
                          width={400}
                          height={400}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div className="post-actions">
                  <span className="action-item">
                    <span className="icon"><Heart size={ICON_SIZE.inline} strokeWidth={iconStroke(ICON_SIZE.inline)} fill={post.isLiked ? 'currentColor' : 'none'} aria-hidden="true" /></span>
                    <span>{post.likesCount}</span>
                  </span>
                  <span className="action-item">
                    <span className="icon"><MessageCircle size={ICON_SIZE.inline} strokeWidth={iconStroke(ICON_SIZE.inline)} aria-hidden="true" /></span>
                    <span>{post.commentsCount}</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      <ShareSheet
        open={shareOpen}
        onClose={closeShare}
        postUrl={shareUrl}
        postTitle={topic.name}
        onShare={(platform) => void onShare(platform)}
      />
    </div>
  );
};
