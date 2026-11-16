import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AtSign, Bell, Heart, MessageCircle, ShieldAlert, UserPlus } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { useNotificationList, type NotificationItem } from '../../hooks/useNotificationList';
import { useConfirm } from '../../hooks/useConfirm';
import { useSyncedSearchParams } from '../../hooks/useSyncedSearchParams';
import { formatRelativeTime } from '../../utils/format';
import { summarizeSecurityNotification } from '../../utils/notificationDisplay';
import { Button } from '../../components/ui/button';
import { EmptyState } from '../../components/ui/emptyState';
import { FilterChip } from '../../components/ui/filterChip';
import { PageHeader } from '../../components/ui/pageHeader';
import { Skeleton } from '../../components/ui/skeleton';
import './notificationListPage.scss';

type NotifyFilter = 'all' | 'social' | 'security';

const NOTIFY_FILTER_QUERY = {
  filter: {
    kind: 'string',
    default: 'all',
    values: ['all', 'social', 'security'] as const,
  },
} as const;

function getNotificationHref(notification: NotificationItem): string | null {
  if (notification.type === 'security') return null;
  if (notification.triggerType === 'post' || notification.triggerType === 'comment') {
    return `/posts/${notification.triggerID}`;
  }
  if (notification.triggerType === 'user') {
    return `/profile/${notification.triggerUserID}`;
  }
  return null;
}

const NotificationListPage: React.FC = () => {
  const [filterQuery, setFilterQuery] = useSyncedSearchParams(NOTIFY_FILTER_QUERY);
  const filter = filterQuery.filter as NotifyFilter;
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
  const [expandedSecurityIds, setExpandedSecurityIds] = useState<Record<number, boolean>>({});

  const visibleNotifications = useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'security') return notifications.filter((n) => n.type === 'security');
    return notifications.filter((n) => n.type !== 'security');
  }, [filter, notifications]);

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

  const markReadIfNeeded = (notification: NotificationItem) => {
    if (!notification.isRead) markAsRead(notification.id);
  };

  const handleSecurityClick = (notification: NotificationItem) => {
    markReadIfNeeded(notification);
    setExpandedSecurityIds((prev) => ({
      ...prev,
      [notification.id]: !prev[notification.id],
    }));
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
        fallbackTo="/messages"
        right={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 text-primary-text"
            onClick={handleMarkAllRead}
          >
            全部已读
          </Button>
        }
      />

      <div className="notification-filters flex flex-wrap gap-2 pb-3">
        {(
          [
            { key: 'all', label: '全部' },
            { key: 'social', label: '互动' },
            { key: 'security', label: '安全' },
          ] as const
        ).map((item) => (
          <FilterChip
            key={item.key}
            active={filter === item.key}
            onClick={() => setFilterQuery({ filter: item.key })}
          >
            {item.label}
          </FilterChip>
        ))}
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
      ) : visibleNotifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={ICON_SIZE.empty} strokeWidth={1.5} />}
          title={filter === 'security' ? '暂无安全通知' : '暂无通知'}
          description={
            filter === 'social' ? '点赞、评论与关注会出现在这里' : undefined
          }
        />
      ) : (
        <div className="notification-list motion-list">
          {visibleNotifications.map((notification) => {
            const security =
              notification.type === 'security'
                ? summarizeSecurityNotification(notification.content)
                : null;
            const expanded = !!expandedSecurityIds[notification.id];
            const desc = security
              ? expanded
                ? security.detail || security.summary
                : security.summary
              : notification.content;
            const href = getNotificationHref(notification);
            const unreadSuffix = notification.isRead ? '' : '，未读';
            const body = (
              <>
                <span className="notification-icon">{getIcon(notification.type)}</span>
                <span className="notification-content">
                  <span className="page-section-title notification-title">
                    {notification.title}
                  </span>
                  <span className="notification-desc">
                    {desc}
                    {security && !expanded && (
                      <span className="notification-detail-hint"> · 查看详情</span>
                    )}
                  </span>
                  <span className="notification-time" title={notification.createdAt}>
                    {formatRelativeTime(notification.createdAt)}
                  </span>
                </span>
                {!notification.isRead && (
                  <span className="unread-dot" aria-hidden="true" />
                )}
              </>
            );

            if (href) {
              return (
                <Link
                  key={notification.id}
                  to={href}
                  className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                  onClick={() => markReadIfNeeded(notification)}
                  aria-label={`${notification.title}${unreadSuffix}`}
                >
                  {body}
                </Link>
              );
            }

            return (
              <button
                type="button"
                key={notification.id}
                className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                onClick={() => handleSecurityClick(notification)}
                aria-expanded={security ? expanded : undefined}
                aria-label={`${notification.title}${unreadSuffix}`}
              >
                {body}
              </button>
            );
          })}
        </div>
      )}

      {total > page * 20 && !loading && (
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

export default NotificationListPage;
