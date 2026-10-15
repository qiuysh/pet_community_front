import { Link, useNavigate } from 'react-router-dom';
import { useTopicList } from '../../hooks/useTopicList';
import { useUserStore } from '../../stores/userStore';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';
import './topicListPage.scss';

export const TopicListPage = () => {
  const { topics, loading, total, totalPages, keyword, setKeyword, page, setPage, search } = useTopicList();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useUserStore();
  const canCreateTopic = !!user && (user.level ?? 0) >= 5;

  return (
    <div className="topic-list-page">
      <div className="topic-header">
        <h1>热门话题</h1>
        <div className="search-box">
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索话题"
            onKeyDown={(e) => e.key === 'Enter' && search()}
          />
          <Button type="button" size="md" onClick={search}>
            搜索
          </Button>
          <Button
            type="button"
            size="md"
            variant="outline"
            aria-label="创建话题"
            onClick={() => {
              if (!isLoggedIn) {
                navigate('/login');
                return;
              }
              navigate('/topics/create');
            }}
          >
            {canCreateTopic ? '创建话题' : '创建话题 (Lv5+)'}
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
        {!loading && topics.length === 0 && <div className="empty">暂无话题</div>}

        {topics.map((topic) => (
          <Link key={topic.id} to={`/topics/${topic.id}`} className="topic-card-link">
            <Card hoverable padding="none" className="topic-card">
              <div className="topic-cover">
                {topic.cover ? (
                  <img src={topic.cover} alt={topic.name} />
                ) : (
                  <div className="cover-placeholder">#</div>
                )}
              </div>
              <div className="topic-info">
                <h3 className="topic-name">{topic.name}</h3>
                <p className="topic-desc">{topic.description || '暂无描述'}</p>
                <div className="topic-stats">
                  <span className="posts-count">{topic.postsCount} 动态</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {total > 20 && (
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
  );
};
