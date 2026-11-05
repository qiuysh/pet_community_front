import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, RefreshCw, Bell } from 'lucide-react';
import { useNotificationList } from '../../hooks/useNotificationList';
import { useConfirm } from '../../hooks/useConfirm';
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
    switch (type) {
      case 'like':
        return <Heart size={24} color="var(--color-primary)" />;
      case 'comment':
        return <MessageCircle size={24} color="var(--color-secondary)" />;
      case 'at':
        return <RefreshCw size={24} color="var(--color-info)" />;
      case 'follow':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary-light)" strokeWidth="2" aria-hidden="true">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
          </svg>
        );
      default:
        return <Bell size={24} color="var(--color-ink-muted)" />;
    }
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="notification-list-page">
      <PageHeader
        title="通知"
        fallbackTo="/"
        right={
          <Button type="button" variant="ghost" size="sm" className="shrink-0 text-primary" onClick={handleMarkAllRead}>
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
        <EmptyState icon={<Bell size={56} strokeWidth={1.5} />} title="暂无通知" />
      ) : (
        <div className="notification-list">
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
                <span className="notification-time">{formatTime(notification.createdAt)}</span>
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
