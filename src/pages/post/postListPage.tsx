import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { usePostList, type PostTab } from '../../hooks/usePostList';
import { PostActions } from '../../components/post/postActions';
import { AdBanner } from '../../components/ad/AdBanner';
import { MapPin, Play } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Avatar } from '../../components/ui/avatar';
import { Tabs } from '../../components/ui/tabs';
import { Spinner } from '../../components/ui/spinner';
import { Skeleton } from '../../components/ui/skeleton';
import './postListPage.scss';

const TABS: { key: PostTab; label: string }[] = [
  { key: 'all', label: '推荐' },
  { key: 'image', label: '图文' },
  { key: 'video', label: '视频' },
];

const LocationIcon = () => (
  <MapPin size={14} aria-hidden="true" />
);

const PlayIcon = () => (
  <Play size={22} fill="currentColor" stroke="none" aria-hidden="true" />
);

export const PostListPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useUserStore();
  const { posts, loading, total, totalPages, tab, page, updateQuery } = usePostList();

  const handlePublish = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/posts/create');
  };

  return (
    <div className="post-list-page">
      <div className="post-list-header">
        <Tabs
          listOnly
          className="tabs-ui"
          selectedKey={tab}
          onSelectionChange={(key) => updateQuery({ tab: key as PostTab, page: 1 })}
          items={TABS.map((t) => ({ key: t.key, title: t.label }))}
        />
        <Button type="button" size="sm" className="publish-btn" onClick={handlePublish}>
          发布
        </Button>
      </div>

      <AdBanner location="home_banner" className="home-banner-slot" />

      <div className="post-list">
        {loading && posts.length === 0 && (
          <div className="loading-skeleton" role="status" aria-live="polite">
            <Spinner size="sm" label="加载中…" className="mx-auto mb-4" />
            {[1, 2, 3].map((i) => (
              <Card key={i} padding="md" className="mb-3">
                <div className="flex gap-3 items-center mb-3">
                  <Skeleton circle className="size-10" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-4/5" />
              </Card>
            ))}
          </div>
        )}
        {!loading && posts.length === 0 && <div className="empty">暂无动态</div>}
        {posts.map((post) => (
          <Card key={post.id} padding="none" className="post-card">
            <article className="post-card-inner">
              <Link
                to={`/posts/${post.id}`}
                className="stretched-link"
                aria-label={`查看 ${post.userNickname} 的动态详情`}
              />
              <div className="post-header">
                <Avatar
                  src={post.userAvatar || getDefaultUserAvatar()}
                  alt={`${post.userNickname}的头像`}
                  name={post.userNickname}
                  size="md"
                  className="avatar"
                />
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
                      <img src={img} alt={`动态配图 ${idx + 1}`} loading="lazy" />
                    </div>
                  ))}
                </div>
              )}
              {post.video && (
                <div className="post-video">
                  <video src={post.video} controls={false} preload="metadata" />
                  <div className="play-btn" aria-hidden="true">
                    <PlayIcon />
                  </div>
                </div>
              )}
              {post.topics && post.topics.length > 0 && (
                <div className="post-topics">
                  {post.topics.map((topic) => (
                    <Link key={topic.id} to={`/topics/${topic.id}`} className="topic-tag">{topic.name}</Link>
                  ))}
                </div>
              )}
              {post.location && (
                <div className="post-location">
                  <LocationIcon />
                  <span>{post.location}</span>
                </div>
              )}
              <PostActions post={post} compact className="post-actions-plain" />
            </article>
          </Card>
        ))}
      </div>

      {total > 0 && (
        <nav className="pagination" aria-label="分页">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => updateQuery({ page: page - 1 })}
            aria-label="上一页"
          >
            上一页
          </Button>
          <span className="page-info tabular-nums">第 {page} 页 / 共 {totalPages} 页</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => updateQuery({ page: page + 1 })}
            aria-label="下一页"
          >
            下一页
          </Button>
        </nav>
      )}
    </div>
  );
};
