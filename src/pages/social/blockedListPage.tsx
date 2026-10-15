import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useBlockedList } from '../../hooks/useBlockedList';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { Avatar } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
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
          <Skeleton className="h-8 w-20 rounded-sm" />
        </div>
      ))}
    </>
  );
}

const BlockedListPage: React.FC = () => {
  const navigate = useNavigate();
  const { users, loading, total, page, setPage, handleUnblock } = useBlockedList();

  return (
    <div className="follow-list-page">
      <div className="page-header">
        <Button type="button" variant="ghost" className="back-btn" onClick={() => navigate(-1)} aria-label="返回">
          <ChevronLeft size={24} aria-hidden="true" />
        </Button>
        <h1 className="page-title">黑名单</h1>
        <div className="placeholder" />
      </div>

      <div className="user-list">
        {loading && users.length === 0 ? (
          <UserListSkeleton />
        ) : users.length === 0 ? (
          <div className="empty">暂无拉黑用户</div>
        ) : (
          users.map((user) => {
            const id = user.userId ?? user.id;
            return (
              <div key={id} className="user-item">
                <button
                  type="button"
                  className="user-item-main"
                  onClick={() => navigate(`/profile/${id}`)}
                >
                  <Avatar
                    className="user-avatar"
                    src={user.avatar || getDefaultUserAvatar()}
                    name={user.nickname}
                    alt={user.nickname}
                  />
                  <div className="user-info">
                    <div className="user-name">{user.nickname}</div>
                    <div className="user-signature">{user.signature || '暂无签名'}</div>
                  </div>
                </button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="follow-btn following"
                  onClick={() => handleUnblock(id)}
                >
                  取消拉黑
                </Button>
              </div>
            );
          })
        )}
      </div>

      {total > page * 20 && (
        <div className="load-more">
          <Button type="button" variant="outline" onClick={() => setPage((prev) => prev + 1)}>
            加载更多
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlockedListPage;
