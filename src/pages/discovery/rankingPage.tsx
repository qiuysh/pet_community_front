import { Link } from 'react-router-dom';
import { useRanking, RankingPeriod } from '../../hooks/useRanking';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { Flame, Heart, MessageCircle, ArrowUpRight } from 'lucide-react';
import { Avatar } from '../../components/ui/avatar';
import { FilterChip } from '../../components/ui/filterChip';
import { Skeleton } from '../../components/ui/skeleton';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import './rankingPage.scss';

const metaIconProps = {
  size: ICON_SIZE.inline,
  strokeWidth: iconStroke(ICON_SIZE.inline),
  'aria-hidden': true as const,
};

export const RankingPage = () => {
  const { loading, data, period, setPeriod } = useRanking();

  const periods: { value: RankingPeriod; label: string }[] = [
    { value: 'day', label: '今日' },
    { value: 'week', label: '本周' },
    { value: 'month', label: '本月' },
  ];

  return (
    <div className="ranking-page">
      <div className="page-header">
        <h1 className="flex items-center gap-2">
          <Flame size={20} aria-hidden="true" />
          <span>热门排行</span>
        </h1>
        <div className="period-tabs flex flex-wrap gap-2">
          {periods.map((p) => (
            <FilterChip
              key={p.value}
              active={period === p.value}
              onClick={() => setPeriod(p.value as 'day' | 'week' | 'month')}
              className="period-tab"
            >
              {p.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="ranking-section space-y-3 p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="ranking-item flex gap-3 items-center">
              <Skeleton className="h-6 w-6 shrink-0" />
              <Skeleton circle className="avatar w-10 h-10" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-3 w-full max-w-sm" />
              </div>
            </div>
          ))}
        </div>
      ) : data && (
        <>
          <div className="ranking-section">
            <div className="section-header">
              <span className="section-title">热门帖子</span>
            </div>
            <div className="ranking-list">
              {(data.posts || []).slice(0, 10).map((post, index) => (
                <div key={post.id} className={`ranking-item ${index < 3 ? 'top-three' : ''}`}>
                  <span className={`rank ${index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''}`}>
                    {index + 1}
                  </span>
                  <div className="item-content">
                    <Link to={`/posts/${post.id}`} className="post-link">
                      <div className="post-header">
                        <Avatar src={post.userAvatar || getDefaultUserAvatar()} name={post.userNickname} className="avatar" />
                        <span className="nickname">{post.userNickname}</span>
                      </div>
                      <div className="post-content">{post.content}</div>
                    </Link>
                    <div className="post-stats">
                      <span className="stat-item flex items-center gap-1"><Heart {...metaIconProps} /><span>{post.likesCount}</span></span>
                      <span className="stat-item flex items-center gap-1"><MessageCircle {...metaIconProps} /><span>{post.commentsCount}</span></span>
                      <span className="stat-item flex items-center gap-1"><ArrowUpRight {...metaIconProps} /><span>{post.sharesCount}</span></span>
                    </div>
                  </div>
                  <span className="hot-score flex items-center gap-1"><Flame {...metaIconProps} /><span>{post.hotScore}</span></span>
                </div>
              ))}
            </div>
          </div>

          <div className="ranking-section">
            <div className="section-header">
              <span className="section-title">人气用户</span>
            </div>
            <div className="ranking-list">
              {(data.users || []).slice(0, 10).map((user, index) => (
                <Link key={user.id} to={`/profile/${user.id}`} className="ranking-item user-item">
                  <span className={`rank ${index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''}`}>
                    {index + 1}
                  </span>
                  <Avatar src={user.avatar || getDefaultUserAvatar()} name={user.nickname} className="avatar" />
                  <div className="user-info">
                    <div className="nickname">{user.nickname}</div>
                    <div className="stats">
                      <span>{user.followersCount}粉丝</span>
                      <span>{user.postsCount}动态</span>
                    </div>
                  </div>
                  <span className="hot-score flex items-center gap-1"><Flame {...metaIconProps} /><span>{user.hotScore}</span></span>
                </Link>
              ))}
            </div>
          </div>

          <div className="ranking-section">
            <div className="section-header">
              <span className="section-title">热门话题</span>
            </div>
            <div className="ranking-list">
              {(data.topics || []).slice(0, 10).map((topic, index) => (
                <Link key={topic.id} to={`/topics/${topic.id}`} className="ranking-item topic-item">
                  <span className={`rank ${index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''}`}>
                    {index + 1}
                  </span>
                  <div className="topic-info">
                    <div className="topic-name">{topic.name}</div>
                    <div className="topic-desc">{topic.description}</div>
                  </div>
                  <div className="topic-stats">
                    <span>{topic.postsCount}帖子</span>
                    <span className="hot-score flex items-center gap-1"><Flame {...metaIconProps} /><span>{topic.hotScore}</span></span>
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