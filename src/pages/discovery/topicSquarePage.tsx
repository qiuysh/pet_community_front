import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTopicSquare } from '../../hooks/useTopicSquare';
import { useUserStore } from '../../stores/userStore';
import { CalendarDays, ChevronRight, Hash, MapPin, PawPrint } from 'lucide-react';
import { CategoryIcon } from '../../components/discovery/categoryIcon';
import { Button, buttonClass } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { EmptyState } from '../../components/ui/emptyState';
import { Skeleton } from '../../components/ui/skeleton';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { formatCount } from '../../utils/format';
import { TOPIC_CREATE_MIN_LEVEL } from '../../utils/topicPolicy';
import { showInfoToast } from '../../utils/toastManager';
import './topicSquarePage.scss';

export const TopicSquarePage = () => {
  const { loading, categories, tags, hotTopics } = useTopicSquare();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useUserStore();
  const canCreateTopic = !!user && (user.level ?? 0) >= TOPIC_CREATE_MIN_LEVEL;
  const [brokenCovers, setBrokenCovers] = useState<Record<number, boolean>>({});

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
          <span className="header-eyebrow">
            <PawPrint
              size={ICON_SIZE.inline}
              strokeWidth={iconStroke(ICON_SIZE.inline)}
              aria-hidden="true"
            />
            宠友社区
          </span>
          <h1 className="page-content-title">话题广场</h1>
          <p>逛分类、追热帖，和宠友一起晒日常、聊养宠趣事</p>
        </div>
        {/* 创建话题入口（T5：须 Lv5+，未登录跳登录） */}
        {canCreateTopic ? (
          <Link
            to="/topics/create"
            className={buttonClass({ size: 'sm', className: 'create-topic-btn' })}
            aria-label="创建话题"
          >
            创建话题
          </Link>
        ) : (
          <Button
            type="button"
            size="sm"
            className="create-topic-btn"
            aria-label={`创建话题（需 Lv${TOPIC_CREATE_MIN_LEVEL} 及以上）`}
            onClick={() => {
              if (!isLoggedIn) {
                navigate('/login', { state: { from: '/topics/create' } });
                return;
              }
              showInfoToast(`创建话题需达到 Lv${TOPIC_CREATE_MIN_LEVEL}`);
            }}
          >
            创建话题 (Lv5+)
          </Button>
        )}
      </div>

      <div className="section pt-4">
        <div className="flex flex-wrap gap-2">
          <Link
            to="/activities"
            className="inline-flex items-center gap-1.5 rounded-md bg-secondary-soft px-3 py-2 text-sm text-secondary-dark hover:bg-secondary/20"
          >
            <CalendarDays size={ICON_SIZE.inline} strokeWidth={iconStroke(ICON_SIZE.inline)} aria-hidden="true" />
            去活动中心看看
          </Link>
          <Link
            to="/lost-pets"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary-soft/60 px-3 py-2 text-sm text-primary-text hover:bg-primary-soft"
          >
            <MapPin size={ICON_SIZE.inline} strokeWidth={iconStroke(ICON_SIZE.inline)} aria-hidden="true" />
            寻宠互助
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="section space-y-6">
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
              <h2 className="page-section-title section-title">话题分类</h2>
              <span className="section-subtitle">选择你感兴趣的分类</span>
            </div>
            <div className="categories-grid">
              {categories.map((cat) => (
                <Link key={cat.id} to={`/category/${cat.id}`} className="category-card-link">
                  <Card hoverable padding="md" className="category-card h-full">
                    <div className="category-icon-wrap">
                      <CategoryIcon categoryName={cat.name} size={ICON_SIZE.feature} color="currentColor" />
                    </div>
                    <div className="page-section-title category-name">{cat.name}</div>
                    <div className="category-desc">{cat.description}</div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <h2 className="page-section-title section-title">热门标签</h2>
              <span className="section-subtitle">点标签去搜索相关内容</span>
            </div>
            <div className="tag-cloud motion-list">
              {tags.length === 0 && <EmptyState compact title="暂无热门标签" />}
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/search?keyword=${encodeURIComponent(tag.name)}`}
                  className={`tag-item ${getTagSize(tag.hot)} ${getTagColorClass(tag.hot)}`}
                >
                  <span className="tag-name">{tag.name}</span>
                  {tag.count > 0 && (
                    <span className="tag-count tabular-nums">{formatCount(tag.count)}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <h2 className="page-section-title section-title">广场热议</h2>
              <span className="section-subtitle">
                参与度最高 ·{' '}
                <Link to="/topics" className="text-primary-text">
                  全部话题库
                </Link>
              </span>
            </div>
            <div className="hot-topics">
              {hotTopics.length === 0 && (
                <EmptyState compact title="暂无热议话题" description="去话题库逛逛，或稍后再来" />
              )}
              {hotTopics.map((topic, index) => (
                <Link
                  key={topic.id}
                  to={`/topics/${topic.id}`}
                  className="hot-topic-item"
                  aria-label={`查看话题 ${topic.name}`}
                >
                  <span className={`rank rank-${index + 1}`}>{index + 1}</span>
                  <div className="topic-icon" aria-hidden="true">
                    {topic.cover && !brokenCovers[topic.id] ? (
                      <img
                        src={topic.cover}
                        alt=""
                        width={36}
                        height={36}
                        loading="lazy"
                        decoding="async"
                        className="topic-cover-thumb"
                        onError={() => setBrokenCovers((prev) => ({ ...prev, [topic.id]: true }))}
                      />
                    ) : (
                      <Hash
                        size={ICON_SIZE.action}
                        strokeWidth={iconStroke(ICON_SIZE.action)}
                        className="topic-cover-fallback-icon"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="topic-info">
                    <div className="page-section-title topic-name">{topic.name}</div>
                    <div className="topic-desc">{topic.description || '暂无描述'}</div>
                  </div>
                  <div className="topic-meta">
                    {topic.postsCount > 0 ? (
                      <span className="posts-count tabular-nums">
                        {formatCount(topic.postsCount)} 动态
                      </span>
                    ) : (
                      <span className="posts-count text-brown-muted">抢先参与</span>
                    )}
                    <span className="topic-arrow" aria-hidden="true">
                      <ChevronRight size={ICON_SIZE.inline} strokeWidth={iconStroke(ICON_SIZE.inline)} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};