import React, { useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ChevronLeft, EyeOff, MoreVertical } from 'lucide-react';
import { useFollowList } from '../../hooks/useFollowList';
import { useUserStore } from '../../stores/userStore';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { Avatar } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Tabs } from '../../components/ui/tabs';
import { Dropdown } from '../../components/ui/dropdown';
import './followListPage.scss';

function UserListSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="user-item">
          <Skeleton circle className="user-avatar !rounded-full" />
          <div className="user-info flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-8 w-16 rounded-sm" />
        </div>
      ))}
    </>
  );
}

/** /follow 无参数时，重定向到当前用户的关注列表 */
export const FollowIndexRedirect: React.FC = () => {
  const { user, fetchProfile, isLoggedIn } = useUserStore();

  useEffect(() => {
    if (isLoggedIn && !user) {
      void fetchProfile();
    }
  }, [isLoggedIn, user, fetchProfile]);

  if (!user?.id) {
    return (
      <div className="follow-list-page">
        <UserListSkeleton />
      </div>
    );
  }

  return <Navigate to={`/follow/${user.id}/following`} replace />;
};

type FollowTab = 'following' | 'followers' | 'secret-following';

const FollowListPage: React.FC = () => {
  const { userId, type } = useParams<{
    userId: string;
    type: string;
  }>();
  const navigate = useNavigate();

  // e2e / 旧链接：/follow/:id/blocked → /blocked
  useEffect(() => {
    if (type === 'blocked') {
      navigate('/blocked', { replace: true });
    }
  }, [type, navigate]);

  const {
    users,
    loading,
    total,
    activeTab,
    page,
    setPage,
    handleFollow,
    handleToggleSecret,
    handleTabChange,
    isOwnList,
  } = useFollowList(parseInt(userId || '0', 10), type);

  const handleUserClick = (id: number) => {
    navigate(`/profile/${id}`);
  };

  const handleTabChangeWithUrl = (tab: FollowTab) => {
    handleTabChange(tab);
    if (userId) {
      navigate(`/follow/${userId}/${tab}`, { replace: true });
    }
  };

  if (type === 'blocked') {
    return null;
  }

  const tabItems = [
    { key: 'following', title: '关注' },
    { key: 'followers', title: '粉丝' },
    // 悄悄关注 tab 仅自己列表可见（F6-02）
    ...(isOwnList ? [{ key: 'secret-following', title: '悄悄关注' }] : []),
  ];

  const emptyText =
    activeTab === 'following' ? '关注' : activeTab === 'followers' ? '粉丝' : '悄悄关注';

  return (
    <div className="follow-list-page">
      <div className="page-header">
        <Button type="button" variant="ghost" className="back-btn" onClick={() => navigate(-1)} aria-label="返回">
          <ChevronLeft size={24} aria-hidden="true" />
        </Button>
        <h1 className="page-title">关系列表</h1>
        <div className="placeholder" />
      </div>

      <div className="tab-bar">
        <Tabs
          listOnly
          className="w-full"
          selectedKey={activeTab}
          onSelectionChange={(key) => handleTabChangeWithUrl(key as FollowTab)}
          items={tabItems}
        />
      </div>

      <div className="user-list">
        {loading && users.length === 0 ? (
          <UserListSkeleton />
        ) : users.length === 0 ? (
          <div className="empty">暂无{emptyText}</div>
        ) : (
          users.map(user => (
            <div key={user.id} className="user-item">
              <button
                type="button"
                className="user-item-main"
                onClick={() => handleUserClick(user.id)}
              >
                <Avatar
                  className="user-avatar"
                  src={user.avatar || getDefaultUserAvatar()}
                  name={user.nickname}
                  alt={user.nickname}
                />
                <div className="user-info">
                  <div className="user-name">
                    {user.nickname}
                    {/* 悄悄关注标识（F6-04） */}
                    {user.isSecret && (
                      <span
                        className="secret-follow-icon"
                        title="悄悄关注"
                        data-testid="secret-follow"
                        aria-label="悄悄关注"
                      >
                        <EyeOff size={14} aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <div className="user-signature">{user.signature || '暂无签名'}</div>
                </div>
              </button>

              {activeTab === 'secret-following' ? (
                // 悄悄关注列表：仅可取消关注
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="follow-btn following"
                  onClick={() => handleFollow(user.id, true)}
                >
                  取消关注
                </Button>
              ) : (
                <div className="follow-action">
                  <Button
                    type="button"
                    size="sm"
                    variant={user.isFollowed ? 'outline' : 'primary'}
                    className={`follow-btn ${user.isFollowed ? 'following' : ''}`}
                    onClick={() => handleFollow(user.id, user.isFollowed || false)}
                  >
                    {user.isFollowed ? '已关注' : '关注'}
                  </Button>
                  {/* 自己的关注列表可切换悄悄关注（F6） */}
                  {isOwnList && activeTab === 'following' && user.isFollowed && (
                    <Dropdown
                      aria-label="关注操作"
                      trigger={
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="secret-toggle"
                          aria-label="更多关注操作"
                        >
                          <MoreVertical size={16} aria-hidden="true" />
                        </Button>
                      }
                      items={[
                        user.isSecret
                          ? { key: 'public', label: '设为公开关注' }
                          : { key: 'secret', label: '设为悄悄关注' },
                      ]}
                      onAction={(key) => {
                        if (key === 'public') void handleToggleSecret(user.id, true);
                        else if (key === 'secret') void handleToggleSecret(user.id, false);
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {total > page * 20 && (
        <div className="load-more">
          <Button type="button" variant="outline" onClick={() => setPage(prev => prev + 1)}>
            加载更多
          </Button>
        </div>
      )}
    </div>
  );
};

export default FollowListPage;
