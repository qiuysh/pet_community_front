import { Link, useNavigate } from 'react-router-dom';
import { useTopicSquare } from '../../hooks/useTopicSquare';
import { useUserStore } from '../../stores/userStore';
import { CategoryIcon } from '../../components/discovery/categoryIcon';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import './topicSquarePage.scss';

export const TopicSquarePage = () => {
  const { loading, categories, tags } = useTopicSquare();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useUserStore();
  const canCreateTopic = !!user && (user.level ?? 0) >= 5;

  const getTagSize = (hot: number) => {
    if (hot >= 100) return 'large';
    if (hot >= 50) return 'medium';
    return 'small';
  };

  const getTagColorClass = (hot: number) => {
    if (hot >= 100) return 'tag-hot';
    if (hot >= 50) return 'tag-warm';
    if (hot >= 20) return 'tag-mild';
    return 'tag-cool';
  };

  return (
    <div className="topic-square-page">
      <div className="page-header">
        <div className="header-decor decor-1" />
        <div className="header-decor decor-2" />
        <div className="header-content">
          <h1>话题广场</h1>
          <p>发现有趣的话题，找到志同道合的朋友</p>
        </div>
        {/* 创建话题入口（T5：须 Lv5+，未登录跳登录） */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="create-topic-btn"
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

      {loading ? (
        <div className="section px-4 space-y-6">
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="categories-grid">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} padding="md" className="category-card">
                  <Skeleton circle className="w-12 h-12 mx-auto mb-3" />
                  <Skeleton className="h-4 w-20 mx-auto mb-2" />
                  <Skeleton className="h-3 w-full" />
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">话题分类</h2>
              <span className="section-subtitle">选择你感兴趣的分类</span>
            </div>
            <div className="categories-grid">
              {categories.map((cat) => (
                <Link key={cat.id} to={`/category/${cat.id}`} className="category-card-link">
                  <Card hoverable padding="md" className="category-card h-full">
                    <div className="category-icon-wrap">
                      <CategoryIcon categoryName={cat.name} size={28} color="currentColor" />
                    </div>
                    <div className="category-name">{cat.name}</div>
                    <div className="category-desc">{cat.description}</div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <h2 className="section-title">热门标签</h2>
              <span className="section-subtitle">大家都在讨论这些</span>
            </div>
            <div className="tag-cloud">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/search?keyword=${encodeURIComponent(tag.name)}`}
                  className={`tag-item ${getTagSize(tag.hot)} ${getTagColorClass(tag.hot)}`}
                >
                  <span className="tag-name">{tag.name}</span>
                  <span className="tag-count">{tag.count}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <h2 className="section-title">热门话题</h2>
              <span className="section-subtitle">参与度最高的话题</span>
            </div>
            <div className="hot-topics">
              {categories.slice(0, 5).map((cat, index) => (
                <div key={cat.id} className="hot-topic-item">
                  <span className={`rank rank-${index + 1}`}>{index + 1}</span>
                  <div className="topic-icon">
                    <CategoryIcon categoryName={cat.name} size={20} color="currentColor" />
                  </div>
                  <div className="topic-info">
                    <div className="topic-name">{cat.name}</div>
                    <div className="topic-desc">{cat.description}</div>
                  </div>
                  <div className="topic-arrow">→</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};