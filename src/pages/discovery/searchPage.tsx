import { Link, useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch';
import { useConfirm } from '../../hooks/useConfirm';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { Search, X, Heart, MessageCircle } from 'lucide-react';
import { Avatar } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { EmptyState } from '../../components/ui/emptyState';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { formatCount } from '../../utils/format';
import './searchPage.scss';

const metaIconProps = {
  size: ICON_SIZE.inline,
  strokeWidth: iconStroke(ICON_SIZE.inline),
  'aria-hidden': true as const,
};
const actionIconProps = {
  size: ICON_SIZE.action,
  strokeWidth: iconStroke(ICON_SIZE.action),
  'aria-hidden': true as const,
};

export const SearchPage = () => {
  const navigate = useNavigate();
  const {
    keyword,
    setKeyword,
    loading,
    result,
    history,
    hotKeywords,
    handleSearch,
    handleDeleteHistory,
    handleClearHistory,
    handleHotKeywordClick,
  } = useSearch();
  const { confirm, confirmDialog } = useConfirm();

  const handleClearHistoryWithConfirm = async () => {
    const confirmed = await confirm({
      title: '清空搜索历史？',
      description: '全部搜索记录将被清除，清除后无法恢复。',
      confirmText: '清空',
    });
    if (confirmed) handleClearHistory();
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="search-input-wrapper">
          <span className="search-icon" aria-hidden="true"><Search {...actionIconProps} /></span>
          <Input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索用户、帖子、话题…"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            aria-label="搜索"
            className="search-field"
          />
          {keyword && (
            <Button type="button" variant="ghost" size="sm" className="clear-btn" onClick={() => setKeyword('')} aria-label="清空">
              <X {...actionIconProps} />
            </Button>
          )}
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => navigate(-1)}>
          取消
        </Button>
      </div>

      {!keyword && (
        <div className="search-content">
          <div className="section">
            <div className="section-header">
              <span className="page-section-title">热门搜索</span>
            </div>
            <div className="hot-keywords">
              {hotKeywords.map((kw, index) => (
                <button
                  type="button"
                  key={kw.id}
                  className="hot-keyword-item"
                  onClick={() => handleHotKeywordClick(kw.keyword)}
                >
                  <span className={`rank ${index < 3 ? 'top' : ''}`}>{kw.rank}</span>
                  <span className="keyword">{kw.keyword}</span>
                  <span className="count tabular-nums">{formatCount(kw.searchCount)}次</span>
                </button>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <span className="page-section-title">搜索历史</span>
              {history.length > 0 && (
                <Button type="button" variant="ghost" size="sm" className="clear-btn" onClick={handleClearHistoryWithConfirm}>
                  清空
                </Button>
              )}
            </div>
            {history.length > 0 ? (
              <div className="history-list">
                {history.map((item) => (
                  <div key={item.id} className="history-item">
                    <span className="history-icon" aria-hidden="true"><Search {...metaIconProps} /></span>
                    <button
                      type="button"
                      className="history-keyword"
                      onClick={() => setKeyword(item.keyword)}
                    >
                      {item.keyword}
                    </button>
                    <Button type="button" variant="ghost" size="sm" className="delete-btn" onClick={() => handleDeleteHistory(item.id)} aria-label="删除历史">
                      <X {...metaIconProps} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState compact title="暂无搜索历史" />
            )}
          </div>
        </div>
      )}

      {keyword && (
        <div className="search-result">
          {loading && (
            <div className="result-section space-y-4 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-center">
                  <Skeleton circle className="avatar w-10 h-10" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && result && (
            <>
              {result.users.length > 0 && (
                <div className="result-section">
                  <div className="page-section-title section-title">用户</div>
                  {result.users.map((user) => (
                    <Link key={user.id} to={`/profile/${user.id}`} className="user-item">
                      <Avatar src={user.avatar || getDefaultUserAvatar()} name={user.nickname} className="avatar" />
                      <div className="user-info">
                        <div className="page-section-title nickname">{user.nickname}</div>
                        <div className="followers tabular-nums">{formatCount(user.followersCount)} 粉丝</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {result.posts.length > 0 && (
                <div className="result-section">
                  <div className="page-section-title section-title">帖子</div>
                  {result.posts.map((post) => (
                    <Link key={post.id} to={`/posts/${post.id}`} className="post-item">
                      <div className="post-header">
                        <Avatar src={post.userAvatar || getDefaultUserAvatar()} name={post.userNickname} className="avatar" />
                        <div className="user-info">
                          <span className="page-section-title nickname">{post.userNickname}</span>
                          <span className="time">{post.createdAt}</span>
                        </div>
                      </div>
                      {post.content && <div className="post-content">{post.content}</div>}
                      {post.images && post.images.length > 0 && (
                        <div className={`post-images grid-${Math.min(post.images.length, 3)}`}>
                          {post.images.slice(0, 9).map((img, idx) => (
                            <div key={idx} className="post-image">
                              <img src={img} alt="" loading="lazy" decoding="async" />
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="post-meta tabular-nums">
                        <span className="action-item">
                          <Heart {...metaIconProps} />
                          <span className="count">{formatCount(post.likesCount)}</span>
                        </span>
                        <span className="action-item">
                          <MessageCircle {...metaIconProps} />
                          <span className="count">{formatCount(post.commentsCount)}</span>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {result.topics.length > 0 && (
                <div className="result-section">
                  <div className="page-section-title section-title">话题</div>
                  {result.topics.map((topic) => (
                    <Link key={topic.id} to={`/topics/${topic.id}`} className="topic-item">
                      <div className="topic-info">
                        <div className="page-section-title topic-name">{topic.name}</div>
                        <div className="topic-desc">{topic.description}</div>
                      </div>
                      <span className="posts-count tabular-nums">{formatCount(topic.postsCount)}帖子</span>
                    </Link>
                  ))}
                </div>
              )}

              {result.users.length === 0 && result.posts.length === 0 && result.topics.length === 0 && (
                <EmptyState title="没有找到相关结果" />
              )}
            </>
          )}
        </div>
      )}

      {confirmDialog}
    </div>
  );
};