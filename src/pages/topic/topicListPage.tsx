import { Link, useNavigate } from 'react-router-dom';
import { Hash, PawPrint } from 'lucide-react';
import { useTopicList } from '../../hooks/useTopicList';
import { useUserStore } from '../../stores/userStore';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { EmptyState } from '../../components/ui/emptyState';
import { Input } from '../../components/ui/input';
import { Pagination } from '../../components/ui/pagination';
import { Skeleton } from '../../components/ui/skeleton';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { formatCount } from '../../utils/format';
import { TOPIC_CREATE_MIN_LEVEL } from '../../utils/topicPolicy';
import { showInfoToast } from '../../utils/toastManager';
import './topicListPage.scss';

export const TopicListPage = () => {
  const { topics, loading, totalPages, keyword, setKeyword, page, setPage, search } = useTopicList();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useUserStore();
  const canCreateTopic = !!user && (user.level ?? 0) >= TOPIC_CREATE_MIN_LEVEL;

  const handleCreate = () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/topics/create' } });
      return;
    }
    if (!canCreateTopic) {
      showInfoToast(`创建话题需达到 Lv${TOPIC_CREATE_MIN_LEVEL}`);
      return;
    }
    navigate('/topics/create');
  };

  return (
    <div className="topic-list-page">
      <div className="topic-header page-header">
        <div className="header-decor decor-1" />
        <div className="header-decor decor-2" />
        <div className="header-content">
          <span className="header-eyebrow">
            <PawPrint
              size={ICON_SIZE.inline}
              strokeWidth={iconStroke(ICON_SIZE.inline)}
              aria-hidden="true"
            />
            从发现继续逛
          </span>
          <h1 className="page-content-title">热门话题</h1>
          <p>检索全部话题；想逛分类与热度导购，先去发现广场</p>
          <div className="header-links">
            <Link to="/discover" className="text-sm font-medium text-primary-text">
              去话题广场
            </Link>
            <span className="text-brown-light" aria-hidden="true">
              ·
            </span>
            <Link to="/search" className="text-sm font-medium text-brown-secondary">
              综合搜索
            </Link>
          </div>
        </div>
        <div className="search-box">
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索话题…"
            aria-label="搜索话题"
            onKeyDown={(e) => e.key === 'Enter' && search()}
          />
          <Button type="button" size="md" onClick={search}>
            搜索
          </Button>
          <Button
            type="button"
            size="md"
            variant={canCreateTopic ? 'primary' : 'outline'}
            aria-label={
              canCreateTopic ? '创建话题' : `创建话题（需 Lv${TOPIC_CREATE_MIN_LEVEL} 及以上）`
            }
            onClick={handleCreate}
          >
            {canCreateTopic ? '创建话题' : `创建话题 (Lv${TOPIC_CREATE_MIN_LEVEL}+)`}
          </Button>
        </div>
      </div>

      <div className="topic-list">
        {loading && topics.length === 0 && (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} padding="none" className="topic-card">
                <Skeleton className="topic-cover w-full aspect-video" />
                <div className="topic-info p-4 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </Card>
            ))}
          </>
        )}
        {!loading && topics.length === 0 && (
          <EmptyState
            title="暂无话题"
            description="换个关键词试试，或去发现广场看看分类"
          />
        )}

        {topics.map((topic) => (
          <Link key={topic.id} to={`/topics/${topic.id}`} className="topic-card-link">
            <Card hoverable padding="none" className="topic-card">
              <div className="topic-cover">
                {topic.cover ? (
                  <img
                    src={topic.cover}
                    alt=""
                    width={400}
                    height={200}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="cover-placeholder" aria-hidden="true">
                    <Hash size={ICON_SIZE.feature} strokeWidth={iconStroke(ICON_SIZE.feature)} />
                  </div>
                )}
              </div>
              <div className="topic-info">
                <h3 className="page-section-title topic-name">{topic.name}</h3>
                <p className="topic-desc">{topic.description || '暂无描述'}</p>
                <div className="topic-stats">
                  <span className="posts-count tabular-nums">
                    {formatCount(topic.postsCount)} 动态
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};
