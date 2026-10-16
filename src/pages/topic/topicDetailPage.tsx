import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTopicDetail } from '../../hooks/useTopicDetail';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { AdBanner } from '../../components/ad/AdBanner';
import { ShareSheet } from '../../components/post/shareSheet';
import { ChevronLeft, Heart, MessageCircle, Share2, UserPlus, UserCheck } from 'lucide-react';
import { Avatar } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import './topicDetailPage.scss';

export const TopicDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    topic,
    loadingTopic,
    posts,
    loadingPosts,
    total,
    totalPages,
    page,
    setPage,
    participating,
    toggleParticipate,
    shareOpen,
    setShareOpen,
    shareUrl,
    openShare,
  } = useTopicDetail(id);

  if (loadingTopic || !topic) {
    return (
      <div className="topic-detail-page">
        <Skeleton className="h-12 w-full mb-4" />
        <Card padding="md" className="topic-info-card mb-4">
          <Skeleton className="topic-cover w-full aspect-video mb-4" />
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="topic-detail-page">
      <div className="detail-header">
        <Button type="button" variant="ghost" className="back-btn" onClick={() => navigate(-1)} aria-label="返回">
          <ChevronLeft size={24} aria-hidden="true" />
        </Button>
        <span className="title">话题详情</span>
      </div>

      <Card padding="none" className="topic-info-card">
        <div className="topic-cover">
          {topic.cover ? (
            <img src={topic.cover} alt={topic.name} />
          ) : (
            <div className="cover-placeholder">#</div>
          )}
        </div>
        <div className="topic-meta">
          <h2 className="topic-name">{topic.name}</h2>
          <p className="topic-desc">{topic.description || '暂无描述'}</p>
          <div className="topic-stats">
            <span>{topic.postsCount} 条动态</span>
            <span>{topic.participantsCount} 人参与</span>
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
                  <UserCheck size={14} aria-hidden="true" />
                  已参与
                </>
              ) : (
                <>
                  <UserPlus size={14} aria-hidden="true" />
                  参与话题
                </>
              )}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => void openShare()}>
              <Share2 size={14} aria-hidden="true" />
              分享
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => navigate(`/posts/create?topicId=${topic.id}`)}
            >
              发动态
            </Button>
          </div>
        </div>
      </Card>

      <AdBanner location="topic_banner" className="topic-banner-slot" />

      <div className="posts-section">
        <h3 className="section-title">相关动态</h3>

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
          {!loadingPosts && posts.length === 0 && <div className="empty">暂无相关动态</div>}

          {posts.map((post) => (
            <Link key={post.id} to={`/posts/${post.id}`} className="post-card">
              <div className="post-header">
                <Avatar src={post.userAvatar || getDefaultUserAvatar()} name={post.userNickname} className="avatar" />
                <div className="user-info">
                  <div className="nickname">{post.userNickname}</div>
                  <div className="time">{post.createdAt}</div>
                </div>
              </div>
              {post.content && <div className="post-content">{post.content}</div>}
              {post.images && post.images.length > 0 && (
                <div className={`post-images grid-${Math.min(post.images.length, 3)}`}>
                  {post.images.slice(0, 9).map((img, idx) => (
                    <div key={idx} className="post-image">
                      <img src={img} alt="" />
                    </div>
                  ))}
                </div>
              )}
              <div className="post-actions">
                <span className="action-item">
                  <span className="icon"><Heart size={16} fill={post.isLiked ? 'currentColor' : 'none'} aria-hidden="true" /></span>
                  <span>{post.likesCount}</span>
                </span>
                <span className="action-item">
                  <span className="icon"><MessageCircle size={16} aria-hidden="true" /></span>
                  <span>{post.commentsCount}</span>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {total > 10 && (
          <div className="pagination">
            <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              上一页
            </Button>
            <span>第 {page} 页 / 共 {totalPages} 页</span>
            <Button type="button" variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              下一页
            </Button>
          </div>
        )}
      </div>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        postUrl={shareUrl}
        postTitle={topic.name}
      />
    </div>
  );
};
