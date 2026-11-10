import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AtSign, Bell, Heart, MessageCircle, ShieldAlert, UserPlus } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { useNotificationList } from '../../hooks/useNotificationList';
import { useConfirm } from '../../hooks/useConfirm';
import { formatRelativeTime } from '../../utils/format';
import { Button } from '../../components/ui/button';
import { EmptyState } from '../../components/ui/emptyState';
import { PageHeader } from '../../components/ui/pageHeader';
import { Skeleton } from '../../components/ui/skeleton';
import './notificationListPage.scss';

const NotificationListPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    total,
    page,
    setPage,
    markAsRead,
    markAllAsRead,
  } = useNotificationList();
  const { confirm, confirmDialog } = useConfirm();

  const handleMarkAllRead = async () => {
    const confirmed = await confirm({
      title: '全部标为已读？',
      description: `当前列表共 ${total} 条通知，未读标记将被一次性清除，该操作无法撤销。`,
      confirmText: '全部已读',
      tone: 'primary',
    });
    if (!confirmed) return;
    markAllAsRead();
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.triggerType === 'post') {
      navigate(`/posts/${notification.triggerID}`);
    } else if (notification.triggerType === 'comment') {
      navigate(`/posts/${notification.triggerID}`);
    } else if (notification.triggerType === 'user') {
      navigate(`/profile/${notification.triggerUserID}`);
    }
  };

  const getIcon = (type: string) => {
    const props = {
      size: ICON_SIZE.nav,
      strokeWidth: iconStroke(ICON_SIZE.nav),
      'aria-hidden': true as const,
    };
    switch (type) {
      case 'like':
        return <Heart {...props} className="text-primary" />;
      case 'comment':
        return <MessageCircle {...props} className="text-secondary" />;
      case 'at':
        return <AtSign {...props} className="text-info" />;
      case 'follow':
        return <UserPlus {...props} className="text-secondary-light" />;
      case 'security':
        return <ShieldAlert {...props} className="text-warning-text" />;
      default:
        return <Bell {...props} className="text-brown-muted" />;
    }
  };

  return (
    <div className="notification-list-page">
      <PageHeader
        title="通知"
        fallbackTo="/"
        right={
          <Button type="button" variant="ghost" size="sm" className="shrink-0 text-primary-text" onClick={handleMarkAllRead}>
            全部已读
          </Button>
        }
      />

      {loading && notifications.length === 0 ? (
        <div className="notification-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="notification-item">
              <Skeleton circle className="w-10 h-10 shrink-0" />
              <div className="notification-content flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-full max-w-sm mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={<Bell size={ICON_SIZE.empty} strokeWidth={1.5} />} title="暂无通知" />
      ) : (
        <div className="notification-list motion-list">
          {notifications.map((notification) => (
            <button
              type="button"
              key={notification.id}
              className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <span className="notification-icon">{getIcon(notification.type)}</span>
              <span className="notification-content">
                <span className="notification-title">{notification.title}</span>
                <span className="notification-desc">{notification.content}</span>
                <span className="notification-time" title={notification.createdAt}>
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </span>
              {!notification.isRead && (
                <span className="unread-dot" />
              )}
            </button>
          ))}
        </div>
      )}

      {total > page * 20 && !loading && (
        <div className="load-more">
          <Button type="button" variant="outline" onClick={() => setPage(prev => prev + 1)}>
            加载更多
          </Button>
        </div>
      )}

      {confirmDialog}
    </div>
  );
};

export default NotificationListPage;
