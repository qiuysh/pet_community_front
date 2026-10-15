import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, RefreshCw, Bell, ChevronLeft } from 'lucide-react';
import { useNotificationList } from '../../hooks/useNotificationList';
import { Button } from '../../components/ui/button';
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
      <div className="page-header">
        <Button type="button" variant="ghost" className="back-btn" onClick={() => navigate(-1)} aria-label="返回">
          <ChevronLeft size={24} aria-hidden="true" />
        </Button>
        <h1 className="page-title">通知</h1>
        <Button type="button" variant="ghost" size="sm" className="action-btn" onClick={markAllAsRead}>
          全部已读
        </Button>
      </div>

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
        <div className="empty">
          <Bell size={64} color="var(--color-ink-light)" strokeWidth={1.5} />
          <p>暂无通知</p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">{getIcon(notification.type)}</div>
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-desc">{notification.content}</div>
                <div className="notification-time">{formatTime(notification.createdAt)}</div>
              </div>
              {!notification.isRead && (
                <div className="unread-dot" />
              )}
            </div>
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
    </div>
  );
};

export default NotificationListPage;
