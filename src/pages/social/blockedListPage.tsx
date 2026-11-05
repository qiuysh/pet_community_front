import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlockedList } from '../../hooks/useBlockedList';
import { useConfirm } from '../../hooks/useConfirm';
import { getDefaultUserAvatar } from '../../utils/avatarUtils';
import { Avatar } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { EmptyState } from '../../components/ui/emptyState';
import { PageHeader } from '../../components/ui/pageHeader';
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
  const { confirm, confirmDialog } = useConfirm();

  const handleUnblockWithConfirm = async (targetId: number, nickname: string) => {
    const confirmed = await confirm({
      title: '取消拉黑？',
      description: `取消拉黑后，你和${nickname || '该用户'}将恢复互看动态、评论与私信的能力。`,
      confirmText: '取消拉黑',
      tone: 'primary',
    });
    if (confirmed) await handleUnblock(targetId);
  };

  return (
    <div className="follow-list-page">
      <PageHeader title="黑名单" fallbackTo="/profile" />

      <div className="user-list">
        {loading && users.length === 0 ? (
          <UserListSkeleton />
        ) : users.length === 0 ? (
          <EmptyState compact title="暂无拉黑用户" />
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
                  onClick={() => handleUnblockWithConfirm(id, user.nickname)}
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

      {confirmDialog}
    </div>
  );
};

export default BlockedListPage;
